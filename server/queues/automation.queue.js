const Queue = require('bull');
const logger = require('../logger');

// Redis connection configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times) => {
    if (times > 3) {
      logger.error('Redis connection failed after 3 retries');
      return null; // Stop retrying
    }
    const delay = Math.min(times * 1000, 5000);
    logger.warn(`Redis retry attempt ${times}, waiting ${delay}ms`);
    return delay;
  }
};

// Create the automation queue
const automationQueue = new Queue('automation', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 200 // Keep last 200 failed jobs
  }
});

// Queue event listeners
automationQueue.on('error', (error) => {
  logger.error('Queue error', { error: error.message, stack: error.stack });
});

automationQueue.on('failed', (job, error) => {
  logger.error('Job failed', {
    jobId: job.id,
    executionId: job.data.executionId,
    error: error.message,
    attemptsMade: job.attemptsMade,
    attemptsLeft: job.opts.attempts - job.attemptsMade
  });
});

automationQueue.on('completed', (job, result) => {
  logger.info('Job completed', {
    jobId: job.id,
    executionId: job.data.executionId,
    duration: Date.now() - job.timestamp
  });
});

automationQueue.on('stalled', (job) => {
  logger.warn('Job stalled', {
    jobId: job.id,
    executionId: job.data.executionId
  });
});

automationQueue.on('active', (job) => {
  logger.info('Job started', {
    jobId: job.id,
    executionId: job.data.executionId,
    attempt: job.attemptsMade + 1
  });
});

automationQueue.on('waiting', (jobId) => {
  logger.debug('Job waiting', { jobId });
});

// Queue health check
async function getQueueHealth() {
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      automationQueue.getWaitingCount(),
      automationQueue.getActiveCount(),
      automationQueue.getCompletedCount(),
      automationQueue.getFailedCount(),
      automationQueue.getDelayedCount()
    ]);

    return {
      healthy: true,
      counts: {
        waiting,
        active,
        completed,
        failed,
        delayed,
        total: waiting + active + completed + failed + delayed
      }
    };
  } catch (error) {
    logger.error('Queue health check failed', { error: error.message });
    return {
      healthy: false,
      error: error.message
    };
  }
}

// Get queue statistics
async function getQueueStats() {
  try {
    const health = await getQueueHealth();
    const jobs = await automationQueue.getJobs(['waiting', 'active', 'completed', 'failed', 'delayed']);

    // Calculate success rate from last 100 jobs
    const recentJobs = jobs.slice(-100);
    const completedRecent = recentJobs.filter(j => j.finishedOn && !j.failedReason).length;
    const failedRecent = recentJobs.filter(j => j.failedReason).length;
    const successRate = recentJobs.length > 0
      ? ((completedRecent / (completedRecent + failedRecent)) * 100).toFixed(2)
      : 0;

    return {
      ...health,
      stats: {
        successRate: `${successRate}%`,
        averageWaitTime: await getAverageWaitTime(),
        averageProcessTime: await getAverageProcessTime()
      }
    };
  } catch (error) {
    logger.error('Failed to get queue stats', { error: error.message });
    throw error;
  }
}

// Get average wait time (time from creation to processing)
async function getAverageWaitTime() {
  try {
    const completed = await automationQueue.getCompleted(0, 50);
    if (completed.length === 0) return 0;

    const waitTimes = completed
      .filter(job => job.processedOn && job.timestamp)
      .map(job => job.processedOn - job.timestamp);

    return waitTimes.length > 0
      ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length)
      : 0;
  } catch (error) {
    return 0;
  }
}

// Get average process time (time spent processing)
async function getAverageProcessTime() {
  try {
    const completed = await automationQueue.getCompleted(0, 50);
    if (completed.length === 0) return 0;

    const processTimes = completed
      .filter(job => job.finishedOn && job.processedOn)
      .map(job => job.finishedOn - job.processedOn);

    return processTimes.length > 0
      ? Math.round(processTimes.reduce((a, b) => a + b, 0) / processTimes.length)
      : 0;
  } catch (error) {
    return 0;
  }
}

// Clean old jobs
async function cleanOldJobs(grace = 24 * 60 * 60 * 1000) {
  try {
    const completed = await automationQueue.clean(grace, 'completed');
    const failed = await automationQueue.clean(grace * 7, 'failed'); // Keep failed jobs longer

    logger.info('Cleaned old jobs', {
      completed: completed.length,
      failed: failed.length
    });

    return { completed: completed.length, failed: failed.length };
  } catch (error) {
    logger.error('Failed to clean old jobs', { error: error.message });
    throw error;
  }
}

// Pause/Resume queue
async function pauseQueue() {
  await automationQueue.pause();
  logger.warn('Queue paused');
}

async function resumeQueue() {
  await automationQueue.resume();
  logger.info('Queue resumed');
}

// Get job by ID
async function getJob(jobId) {
  return await automationQueue.getJob(jobId);
}

// Close queue connection
async function closeQueue() {
  await automationQueue.close();
  logger.info('Queue connection closed');
}

module.exports = {
  automationQueue,
  getQueueHealth,
  getQueueStats,
  cleanOldJobs,
  pauseQueue,
  resumeQueue,
  getJob,
  closeQueue
};
