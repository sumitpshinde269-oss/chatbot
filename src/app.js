const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('express-async-errors');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: config.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests, please try again later.',
});
app.use('/api', limiter);

// Routes
app.use('/api/v1', routes);

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Global error handler
app.use(errorHandler);

module.exports = app;