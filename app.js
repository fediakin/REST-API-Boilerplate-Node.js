import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { errors as celebrateErrors } from 'celebrate';
import cookieParser from 'cookie-parser';

import announcementsRouter from './src/routes/announcements.routes.js';
import authRouter from './src/routes/auth.routes.js';

const app = express();

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'REST API з JWT',
      version: '1.0.0',
      description: 'Документація до Дошки оголошень з авторизацією',
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(express.json());
app.use(cookieParser());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Підключення маршрутів
app.use('/auth', authRouter);
app.use('/announcements', announcementsRouter);

// Обробка помилок валідації Celebrate
app.use(celebrateErrors());

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Глобальний обробник помилок
app.use((err, req, res, next) => {
  console.error(err);

  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err.type === 'entity.parse.failed' && err.status === 400) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Resource not found' });
  }
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Unique constraint violation' });
  }

  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API docs: http://localhost:${PORT}/api-docs`);
});