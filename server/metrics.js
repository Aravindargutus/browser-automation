/**
 * Application Metrics Tracking
 * Tracks various metrics for monitoring application health and performance
 */

class Metrics {
  constructor() {
    this.startTime = Date.now();
    this.resetMetrics();
  }

  resetMetrics() {
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        failed: 0,
        byStatusCode: {}
      },
      authentication: {
        attempts: 0,
        successful: 0,
        failed: 0
      },
      automation: {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        totalSteps: 0,
        totalActionsExecuted: 0,
        byAction: {}
      },
      ollama: {
        requests: 0,
        successful: 0,
        failed: 0,
        totalResponseTime: 0,
        averageResponseTime: 0
      },
      performance: {
        totalResponseTime: 0,
        averageResponseTime: 0,
        slowestRequest: null,
        fastestRequest: null
      },
      errors: {
        total: 0,
        byType: {}
      }
    };
  }

  // Request tracking
  recordRequest(statusCode, duration) {
    this.metrics.requests.total++;

    if (statusCode >= 200 && statusCode < 300) {
      this.metrics.requests.success++;
    } else if (statusCode >= 400) {
      this.metrics.requests.failed++;
    }

    // Track by status code
    this.metrics.requests.byStatusCode[statusCode] =
      (this.metrics.requests.byStatusCode[statusCode] || 0) + 1;

    // Track performance
    this.metrics.performance.totalResponseTime += duration;
    this.metrics.performance.averageResponseTime =
      this.metrics.performance.totalResponseTime / this.metrics.requests.total;

    if (!this.metrics.performance.slowestRequest ||
        duration > this.metrics.performance.slowestRequest.duration) {
      this.metrics.performance.slowestRequest = { duration, timestamp: new Date() };
    }

    if (!this.metrics.performance.fastestRequest ||
        duration < this.metrics.performance.fastestRequest.duration) {
      this.metrics.performance.fastestRequest = { duration, timestamp: new Date() };
    }
  }

  // Authentication tracking
  recordAuthAttempt(success) {
    this.metrics.authentication.attempts++;
    if (success) {
      this.metrics.authentication.successful++;
    } else {
      this.metrics.authentication.failed++;
    }
  }

  // Automation execution tracking
  recordAutomationExecution(success, steps = []) {
    this.metrics.automation.totalExecutions++;

    if (success) {
      this.metrics.automation.successfulExecutions++;
    } else {
      this.metrics.automation.failedExecutions++;
    }

    this.metrics.automation.totalSteps += steps.length;

    // Track actions by type
    steps.forEach(step => {
      if (step.action) {
        this.metrics.automation.byAction[step.action] =
          (this.metrics.automation.byAction[step.action] || 0) + 1;
        this.metrics.automation.totalActionsExecuted++;
      }
    });
  }

  // Ollama API tracking
  recordOllamaRequest(success, responseTime) {
    this.metrics.ollama.requests++;

    if (success) {
      this.metrics.ollama.successful++;
      this.metrics.ollama.totalResponseTime += responseTime;
      this.metrics.ollama.averageResponseTime =
        this.metrics.ollama.totalResponseTime / this.metrics.ollama.successful;
    } else {
      this.metrics.ollama.failed++;
    }
  }

  // Error tracking
  recordError(errorType) {
    this.metrics.errors.total++;
    this.metrics.errors.byType[errorType] =
      (this.metrics.errors.byType[errorType] || 0) + 1;
  }

  // Get all metrics
  getMetrics() {
    return {
      ...this.metrics,
      uptime: {
        seconds: Math.floor((Date.now() - this.startTime) / 1000),
        formatted: this.formatUptime(Date.now() - this.startTime)
      },
      timestamp: new Date().toISOString()
    };
  }

  // Get health status
  getHealthStatus() {
    const uptime = Date.now() - this.startTime;
    const errorRate = this.metrics.requests.total > 0
      ? (this.metrics.requests.failed / this.metrics.requests.total) * 100
      : 0;

    const authFailureRate = this.metrics.authentication.attempts > 0
      ? (this.metrics.authentication.failed / this.metrics.authentication.attempts) * 100
      : 0;

    const automationSuccessRate = this.metrics.automation.totalExecutions > 0
      ? (this.metrics.automation.successfulExecutions / this.metrics.automation.totalExecutions) * 100
      : 100;

    // Determine overall health
    let status = 'healthy';
    let issues = [];

    if (errorRate > 50) {
      status = 'unhealthy';
      issues.push(`High error rate: ${errorRate.toFixed(2)}%`);
    } else if (errorRate > 20) {
      status = 'degraded';
      issues.push(`Elevated error rate: ${errorRate.toFixed(2)}%`);
    }

    if (authFailureRate > 50 && this.metrics.authentication.attempts > 10) {
      status = 'degraded';
      issues.push(`High auth failure rate: ${authFailureRate.toFixed(2)}%`);
    }

    if (automationSuccessRate < 50 && this.metrics.automation.totalExecutions > 5) {
      status = 'degraded';
      issues.push(`Low automation success rate: ${automationSuccessRate.toFixed(2)}%`);
    }

    return {
      status,
      uptime: {
        seconds: Math.floor(uptime / 1000),
        formatted: this.formatUptime(uptime)
      },
      checks: {
        errorRate: {
          status: errorRate < 20 ? 'ok' : errorRate < 50 ? 'warning' : 'critical',
          value: `${errorRate.toFixed(2)}%`,
          threshold: '20%'
        },
        authFailureRate: {
          status: authFailureRate < 20 ? 'ok' : authFailureRate < 50 ? 'warning' : 'critical',
          value: `${authFailureRate.toFixed(2)}%`,
          threshold: '20%'
        },
        automationSuccessRate: {
          status: automationSuccessRate > 80 ? 'ok' : automationSuccessRate > 50 ? 'warning' : 'critical',
          value: `${automationSuccessRate.toFixed(2)}%`,
          threshold: '80%'
        },
        averageResponseTime: {
          status: this.metrics.performance.averageResponseTime < 5000 ? 'ok' : 'warning',
          value: `${this.metrics.performance.averageResponseTime.toFixed(0)}ms`,
          threshold: '5000ms'
        }
      },
      issues,
      timestamp: new Date().toISOString()
    };
  }

  // Get summary statistics
  getSummary() {
    const errorRate = this.metrics.requests.total > 0
      ? ((this.metrics.requests.failed / this.metrics.requests.total) * 100).toFixed(2)
      : '0.00';

    const automationSuccessRate = this.metrics.automation.totalExecutions > 0
      ? ((this.metrics.automation.successfulExecutions / this.metrics.automation.totalExecutions) * 100).toFixed(2)
      : '100.00';

    return {
      requests: {
        total: this.metrics.requests.total,
        success: this.metrics.requests.success,
        failed: this.metrics.requests.failed,
        errorRate: `${errorRate}%`
      },
      automation: {
        executions: this.metrics.automation.totalExecutions,
        successRate: `${automationSuccessRate}%`,
        totalSteps: this.metrics.automation.totalSteps,
        totalActions: this.metrics.automation.totalActionsExecuted
      },
      performance: {
        averageResponseTime: `${this.metrics.performance.averageResponseTime.toFixed(0)}ms`,
        slowest: this.metrics.performance.slowestRequest
          ? `${this.metrics.performance.slowestRequest.duration.toFixed(0)}ms`
          : 'N/A',
        fastest: this.metrics.performance.fastestRequest
          ? `${this.metrics.performance.fastestRequest.duration.toFixed(0)}ms`
          : 'N/A'
      },
      uptime: this.formatUptime(Date.now() - this.startTime)
    };
  }

  // Format uptime in human-readable format
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // Reset all metrics (useful for testing or periodic resets)
  reset() {
    this.startTime = Date.now();
    this.resetMetrics();
  }
}

// Singleton instance
const metrics = new Metrics();

module.exports = metrics;
