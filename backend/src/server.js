const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { errorHandler, notFound } = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const clientRoutes = require('./routes/clientRoutes');
const caseRoutes = require('./routes/caseRoutes');
const taskRoutes = require('./routes/taskRoutes');
const documentRoutes = require('./routes/documentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const auditRoutes = require('./routes/auditRoutes');
const searchRoutes = require('./routes/searchRoutes');

const app = express();

// Basic security / CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploaded documents
app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', 'uploads'), {
    maxAge: '1d',
    setHeaders: (res) => {
      res.setHeader('Content-Security-Policy', "default-src 'none'");
    },
  })
);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/search', searchRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404 and error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lexhub';

async function start() {
  try {
    await mongoose.connect(MONGO_URI, {
      autoIndex: true,
    });
    // eslint-disable-next-line no-console
    console.log('MongoDB connected');

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = app;

