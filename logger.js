const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logsDir = path.join(__dirname, 'logs');
    this.ensureLogsDirectory();
    this.setupLogFiles();
  }

  ensureLogsDirectory() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  setupLogFiles() {
    const today = this.getWestCoastDate();
    this.backendLogFile = path.join(this.logsDir, `backend-${today}.log`);
    this.frontendLogFile = path.join(this.logsDir, `frontend-${today}.log`);
  }

  getWestCoastDate() {
    const now = new Date();
    const westCoastTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    return westCoastTime.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  getWestCoastTimestamp() {
    const now = new Date();
    const westCoastTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    return westCoastTime.toISOString().replace('T', ' ').substring(0, 23) + ' PST/PDT';
  }

  writeToFile(filePath, message) {
    try {
      fs.appendFileSync(filePath, message + '\n', 'utf8');
    } catch (error) {
      // Fallback to console if file write fails
      console.error('Failed to write to log file:', error);
      console.error('Original log:', message);
    }
  }

  formatLog(level, source, message, data = null) {
    const timestamp = this.getWestCoastTimestamp();
    let logMessage = `[${timestamp}] [${level}] [${source}] ${message}`;
    
    if (data !== null && data !== undefined) {
      logMessage += ` | Data: ${JSON.stringify(data)}`;
    }
    
    return logMessage;
  }

  log(level, source, message, data = null) {
    const formattedMessage = this.formatLog(level, source, message, data);
    
    // Write to appropriate log file
    if (source === 'FRONTEND') {
      this.writeToFile(this.frontendLogFile, formattedMessage);
    } else {
      this.writeToFile(this.backendLogFile, formattedMessage);
    }
    
    // Also output to console with appropriate level
    switch (level) {
      case 'ERROR':
        console.error(formattedMessage);
        break;
      case 'WARN':
        console.warn(formattedMessage);
        break;
      case 'INFO':
        console.log(formattedMessage);
        break;
      case 'DEBUG':
        if (process.env.NODE_ENV !== 'production') {
          console.log(formattedMessage);
        }
        break;
      default:
        console.log(formattedMessage);
    }
  }

  info(source, message, data = null) {
    this.log('INFO', source, message, data);
  }

  error(source, message, data = null) {
    this.log('ERROR', source, message, data);
  }

  warn(source, message, data = null) {
    this.log('WARN', source, message, data);
  }

  debug(source, message, data = null) {
    this.log('DEBUG', source, message, data);
  }

  // Log HTTP requests
  logRequest(req, res, responseTime = null) {
    const data = {
      method: req.method,
      path: req.path,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      statusCode: res.statusCode,
      responseTime: responseTime ? `${responseTime}ms` : null
    };
    this.info('HTTP', `${req.method} ${req.path} - ${res.statusCode}`, data);
  }

  // Log frontend console messages
  logFrontendConsole(level, message, stack = null, additionalData = null) {
    const data = {
      message,
      stack,
      ...additionalData
    };
    this.log(level, 'FRONTEND', message, data);
  }
}

// Export singleton instance
module.exports = new Logger();

