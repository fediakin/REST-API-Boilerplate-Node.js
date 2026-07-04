import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { errors as celebrateErrors } from 'celebrate';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';

import logger from './src/logger.js';
import announcementsRouter from './src/routes/announcements.routes.js';
import authRouter from './src/routes/auth.routes.js';

const app = express();

// 1. Безпека: Helmet та CORS
app.use(helmet());

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// 2. Логування HTTP-запитів
app.use(pinoHttp({ logger }));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'REST API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(express.json());
app.use(cookieParser());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 3. Rate limiting (тільки для /auth)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 хвилин
  max: 10, // Ліміт: 10 запитів
  message: { error: 'Too many requests, please try again later' }
});

app.use('/auth', authLimiter, authRouter);
app.use('/announcements', announcementsRouter);

app.use(celebrateErrors());

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  logger.error(err); // Логуємо помилку

  if (err.message === 'Not allowed by CORS') return res.status(403).json({ error: err.message });
  if (err.status) return res.status(err.status).json({ error: err.message });
  if (err.type === 'entity.parse.failed' && err.status === 400) return res.status(400).json({ error: 'Invalid JSON' });
  if (err.code === 'P2025') return res.status(404).json({ error: 'Resource not found' });
  if (err.code === 'P2002') return res.status(409).json({ error: 'Unique constraint violation' });

  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`API docs: http://localhost:${PORT}/api-docs`);
});