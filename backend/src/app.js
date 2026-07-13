// =========================================
// APP: Konfigurasi Express (keamanan, CORS, routes)
// =========================================
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Helmet: set header keamanan (XSS protection, no-sniff, dll)
app.use(helmet());

// CORS: hanya izinkan origin frontend yang sah, dengan credentials (cookie)
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: '10kb' })); // batasi ukuran body -> cegah DoS payload besar
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
