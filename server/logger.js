const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development (human-readable)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Configure log level from environment
const logLevel = process.env.LOG_LEVEL || 'info';
const nodeEnv = process.env.NODE_ENV || 'development';

// Create transports array
const transports = [];

// Console transport (always enabled)
transports.push(
  new winston.transports.Console({
    format: nodeEnv === 'production' ? logFormat : consoleFormat,
    level: logLevel
  })
);

// File transports (rotating logs)
if (process.env.LOG_TO_FILE !== 'false') {
  // Combined log (all levels)
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: process.env.LOG_MAX_SIZE || '20m',
      maxFiles: process.env.LOG_MAX_FILES || '14d',
      format: logFormat,
      level: logLevel
    })
  );

  // Error log (error level only)
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: process.env.LOG_MAX_SIZE || '20m',
      maxFiles: process.env.LOG_MAX_FILES || '30d',
      format: logFormat,
      level: 'error'
    })
  );

  // Access log (HTTP requests)
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'access-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: process.env.LOG_MAX_SIZE || '20m',
      maxFiles: process.env.LOG_MAX_FILES || '14d',
      format: logFormat,
      level: 'http'
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  transports,
  exitOnError: false
});

// Add stream for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

// Add helper methods for structured logging
logger.logRequest = (req, metadata = {}) => {
  logger.http('HTTP Request', {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    ...metadata
  });
};

logger.logResponse = (req, res, duration, metadata = {}) => {
  logger.http('HTTP Response', {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    ...metadata
  });
};

logger.logAuth = (success, ip, metadata = {}) => {
  const level = success ? 'info' : 'warn';
  logger.log(level, 'Authentication attempt', {
    success,
    ip,
    ...metadata
  });
};

logger.logBrowserAction = (action, success, metadata = {}) => {
  logger.info('Browser action', {
    action,
    success,
    ...metadata
  });
};

logger.logOllamaRequest = (prompt, metadata = {}) => {
  logger.info('Ollama request', {
    promptLength: prompt.length,
    promptPreview: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
    ...metadata
  });
};

logger.logOllamaResponse = (success, steps, metadata = {}) => {
  logger.info('Ollama response', {
    success,
    stepsCount: steps?.length || 0,
    ...metadata
  });
};

logger.logError = (error, context = {}) => {
  logger.error('Error occurred', {
    message: error.message,
    stack: error.stack,
    ...context
  });
};

// Log startup information
logger.info('Logger initialized', {
  level: logLevel,
  environment: nodeEnv,
  logToFile: process.env.LOG_TO_FILE !== 'false',
  logsDirectory: logsDir
});

module.exports = logger;
