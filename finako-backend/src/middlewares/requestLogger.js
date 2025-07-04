// Request logging middleware
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

module.exports = function requestLogger(req, res, next) {
  const startTime = Date.now();
  
  // Generate unique request ID
  req.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Log request
  const requestLog = {
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined,
    query: Object.keys(req.query).length > 0 ? req.query : undefined
  };

  console.log(`[${requestLog.timestamp}] ${req.method} ${req.originalUrl} - ${req.ip}`);

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const responseLog = {
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      responseSize: JSON.stringify(data).length
    };

    console.log(`[${responseLog.timestamp}] ${res.statusCode} ${req.method} ${req.originalUrl} - ${duration}ms`);

    // Write to file in production
    if (process.env.NODE_ENV === 'production') {
      const logEntry = {
        ...requestLog,
        response: responseLog
      };
      
      const logFile = path.join(logsDir, `access-${new Date().toISOString().split('T')[0]}.log`);
      fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    }

    return originalJson.call(this, data);
  };

  next();
};

// Helper function to sanitize sensitive data from request body
function sanitizeBody(body) {
  if (!body || typeof body !== 'object') return body;
  
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
  const sanitized = { ...body };
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
}
