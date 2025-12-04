const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logger.logRequest(req, res, responseTime);
  });
  
  next();
});

// In-memory storage for scores (in production, use a database)
let scores = {
  low: 0,
  medium: 0,
  high: 0,
  extreme: 0
};

// Frontend log endpoint
app.post('/api/log', (req, res) => {
  try {
    const { level, message, stack, data } = req.body;
    
    if (!level || !message) {
      return res.status(400).json({ error: 'Level and message are required' });
    }
    
    // Map frontend log levels to backend log levels
    const logLevel = level.toUpperCase();
    logger.logFrontendConsole(logLevel, message, stack, data);
    
    res.json({ success: true });
  } catch (error) {
    logger.error('API', 'Error processing frontend log', { error: error.message });
    res.status(500).json({ error: 'Failed to process log' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  const timestamp = logger.getWestCoastTimestamp();
  res.json({ status: 'ok', timestamp });
});

// Get scores endpoint
app.get('/api/scores', (req, res) => {
  res.json(scores);
});

// Record blast endpoint
app.post('/api/blast', (req, res) => {
  const { intensity } = req.body;
  
  if (!intensity || !['low', 'medium', 'high', 'extreme'].includes(intensity)) {
    logger.warn('API', 'Invalid blast intensity', { intensity });
    return res.status(400).json({ error: 'Invalid intensity level' });
  }
  
  scores[intensity]++;
  logger.info('API', `Blast recorded at ${intensity} intensity`, { intensity, scores: { ...scores } });
  
  res.json({ 
    success: true, 
    scores,
    message: `Blast recorded at ${intensity} intensity`
  });
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('SERVER', 'Unhandled error', { 
    error: err.message, 
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  logger.warn('HTTP', '404 Not Found', { path: req.path, method: req.method });
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  logger.info('SERVER', `Pika-Blast server running on port ${PORT}`);
  logger.info('SERVER', `Environment: ${NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SERVER', 'SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SERVER', 'SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Log unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('SERVER', 'Unhandled promise rejection', { reason, promise });
});

// Log uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('SERVER', 'Uncaught exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

