import express from 'express';
import * as controller from '../controllers/auth.controller.js';
import * as validator from '../validators/auth.validator.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Реєстрація нового користувача
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, name]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Успішна реєстрація
 */
router.post('/register', validator.registerValidator, controller.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Вхід користувача
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успішний вхід
 */
router.post('/login', validator.loginValidator, controller.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Оновлення токенів
 *     responses:
 *       200:
 *         description: Токени оновлено
 */
router.post('/refresh', validator.refreshValidator, controller.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Вихід з системи
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успішний вихід
 */
router.post('/logout', authenticate, controller.logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Отримання профілю поточного користувача
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Дані користувача
 */
router.get('/me', authenticate, controller.getMe);

export default router;