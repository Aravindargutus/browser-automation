const { chromium } = require('playwright');
const path = require('path');
const logger = require('../logger');
const metrics = require('../metrics');
const db = require('../services/file-database.service');

/**
 * Automation Worker
 * Processes automation jobs from the queue
 * Handles browser initialization, step execution, and cleanup
 */

// Browser pool (reuse browser instances for better performance)
let browserPool = [];
const MAX_BROWSERS = parseInt(process.env.MAX_CONCURRENT_BROWSERS) || 3;

// Configuration
const config = {
  browserHeadless: process.env.BROWSER_HEADLESS !== 'false',
  browserViewportWidth: parseInt(process.env.BROWSER_VIEWPORT_WIDTH) || 1920,
  browserViewportHeight: parseInt(process.env.BROWSER_VIEWPORT_HEIGHT) || 1080,
  uploadDir: process.env.UPLOAD_DIR || './uploads'
};

const uploadsDir = path.join(__dirname, '../..', config.uploadDir);

/**
 * Get or create a browser from the pool
 */
async function getBrowser() {
  // Check for available browser in pool
  if (browserPool.length > 0) {
    const browser = browserPool.pop();
    if (browser.isConnected()) {
      logger.debug('Reusing browser from pool', { poolSize: browserPool.length });
      return browser;
    }
  }

  // Create new browser
  try {
    const browser = await chromium.launch({
      headless: config.browserHeadless,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        `--window-size=${config.browserViewportWidth},${config.browserViewportHeight}`
      ]
    });

    logger.info('New browser launched', { poolSize: browserPool.length });
    return browser;
  } catch (error) {
    logger.error('Failed to launch browser', { error: error.message });
    throw new Error(`Browser launch failed: ${error.message}`);
  }
}

/**
 * Return browser to pool or close if pool is full
 */
async function releaseBrowser(browser) {
  try {
    if (!browser || !browser.isConnected()) {
      return;
    }

    if (browserPool.length < MAX_BROWSERS) {
      browserPool.push(browser);
      logger.debug('Browser returned to pool', { poolSize: browserPool.length });
    } else {
      await browser.close();
      logger.debug('Browser closed (pool full)', { poolSize: browserPool.length });
    }
  } catch (error) {
    logger.error('Error releasing browser', { error: error.message });
  }
}

/**
 * Create browser context with human-like settings
 */
async function createContext(browser) {
  return await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: config.browserViewportWidth, height: config.browserViewportHeight },
    deviceScaleFactor: 1,
    hasTouch: false,
    isMobile: false,
    locale: 'en-US',
    timezoneId: 'America/New_York',
    geolocation: { longitude: -73.935242, latitude: 40.730610 },
    permissions: ['geolocation'],
    httpCredentials: undefined,
    offline: false,
    colorScheme: 'light',
    reducedMotion: 'no-preference',
    forcedColors: 'none',
    acceptDownloads: true,
    defaultBrowserType: 'chromium',
    bypassCSP: false,
    javaScriptEnabled: true,
    recordVideo: {
      dir: uploadsDir,
      size: { width: config.browserViewportWidth, height: config.browserViewportHeight }
    },
    extraHTTPHeaders: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1'
    }
  });
}

/**
 * Import executeSteps from server.js (or create simplified version)
 * For now, we'll create a simplified version
 */
async function executeSteps(page, steps) {
  const results = [];

  const addRandomDelay = async () => {
    const delay = Math.floor(Math.random() * (2000 - 500) + 500);
    await new Promise(resolve => setTimeout(resolve, delay));
  };

  const humanType = async (selector, text) => {
    await page.waitForSelector(selector);
    const element = await page.$(selector);
    await element.focus();

    for (const char of text) {
      await page.type(selector, char, {
        delay: Math.floor(Math.random() * (200 - 50) + 50)
      });
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    }
  };

  const takeScreenshot = async () => {
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: true,
      encoding: 'base64'
    });
    results.push({
      type: 'screenshot',
      data: screenshot,
      timestamp: new Date().toISOString()
    });
  };

  for (const step of steps) {
    try {
      logger.debug('Executing step', { action: step.action, selector: step.selector });
      await addRandomDelay();

      switch (step.action) {
        case 'navigate':
          await page.goto(step.value);
          await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
          await takeScreenshot();
          break;

        case 'click':
          await page.waitForSelector(step.selector);
          await page.hover(step.selector);
          await addRandomDelay();
          await page.click(step.selector);
          await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
          await takeScreenshot();
          break;

        case 'type':
          if (step.value === '\n') {
            await Promise.all([
              page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => {}),
              page.keyboard.press('Enter')
            ]);
            await addRandomDelay();
          } else {
            await humanType(step.selector, step.value);
          }
          await takeScreenshot();
          break;

        case 'screenshot':
          await takeScreenshot();
          break;

        // Add more action handlers as needed
        default:
          logger.warn('Unknown action type', { action: step.action });
      }

      results.push({
        type: 'action',
        action: step.action,
        reasoning: step.reasoning,
        success: true,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Step execution failed', {
        action: step.action,
        error: error.message
      });

      results.push({
        type: 'action',
        action: step.action,
        reasoning: step.reasoning,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      try {
        await takeScreenshot();
      } catch (screenshotError) {
        logger.error('Failed to take error screenshot', {
          error: screenshotError.message
        });
      }
    }
  }

  return results;
}

/**
 * Main job processor
 * This function is called by Bull for each job
 */
async function processAutomationJob(job) {
  const { executionId, steps, prompt } = job.data;
  const startTime = Date.now();

  logger.info('Processing automation job', {
    jobId: job.id,
    executionId,
    stepsCount: steps.length,
    attempt: job.attemptsMade + 1
  });

  let browser = null;
  let context = null;

  try {
    // Update job progress
    await job.progress(10);

    // Get browser from pool
    browser = await getBrowser();
    await job.progress(20);

    // Create context
    context = await createContext(browser);
    const page = await context.newPage();

    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    await job.progress(30);

    // Execute steps
    const results = await executeSteps(page, steps);
    await job.progress(70);

    // Wait a bit after execution
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Take final screenshot
    const screenshotPath = path.join(uploadsDir, `screenshot-${Date.now()}.png`);
    await page.screenshot({
      path: screenshotPath,
      type: 'png',
      fullPage: true
    });
    const screenshotUrl = `/uploads/${path.basename(screenshotPath)}`;

    await job.progress(85);

    // Get video path
    const videoPath = await page.video().path();
    const videoUrl = `/uploads/${path.basename(videoPath)}`;

    await job.progress(90);

    // Close context
    await context.close();

    // Return browser to pool
    await releaseBrowser(browser);

    await job.progress(95);

    // Update execution in database
    const executionTime = Date.now() - startTime;
    await db.updateExecution(executionId, {
      status: 'success',
      endTime: new Date(),
      results,
      screenshot: screenshotUrl,
      videoUrl
    });

    await job.progress(100);

    logger.info('Job completed successfully', {
      jobId: job.id,
      executionId,
      executionTime,
      stepsExecuted: steps.length
    });

    metrics.recordAutomationExecution(true, steps);

    return {
      success: true,
      executionId,
      screenshot: screenshotUrl,
      videoUrl,
      results,
      executionTime
    };

  } catch (error) {
    const executionTime = Date.now() - startTime;

    logger.error('Job failed', {
      jobId: job.id,
      executionId,
      error: error.message,
      stack: error.stack,
      executionTime
    });

    // Update execution as failed
    try {
      await db.updateExecution(executionId, {
        status: 'failed',
        endTime: new Date(),
        errorLog: error.message
      });
    } catch (dbError) {
      logger.error('Failed to update execution status', {
        executionId,
        error: dbError.message
      });
    }

    // Cleanup
    try {
      if (context) await context.close();
      if (browser) await releaseBrowser(browser);
    } catch (cleanupError) {
      logger.error('Cleanup failed', { error: cleanupError.message });
    }

    metrics.recordAutomationExecution(false, steps);
    metrics.recordError('job_execution_failed');

    throw error; // Re-throw to mark job as failed
  }
}

/**
 * Cleanup function - close all browsers in pool
 */
async function cleanup() {
  logger.info('Cleaning up browser pool', { poolSize: browserPool.length });

  for (const browser of browserPool) {
    try {
      if (browser.isConnected()) {
        await browser.close();
      }
    } catch (error) {
      logger.error('Error closing browser', { error: error.message });
    }
  }

  browserPool = [];
  logger.info('Browser pool cleaned up');
}

// Handle process termination
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, cleaning up...');
  await cleanup();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, cleaning up...');
  await cleanup();
  process.exit(0);
});

module.exports = {
  processAutomationJob,
  cleanup
};
