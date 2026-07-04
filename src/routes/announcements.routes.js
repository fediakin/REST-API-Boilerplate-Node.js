import express from 'express';
import * as controller from '../controllers/announcements.controller.js';
import * as validator from '../validators/announcements.validators.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /announcements:
 *   get:
 *     summary: Отримати список оголошень
 */
router.get('/', validator.getAllValidator, controller.getAllAnnouncements);

/**
 * @swagger
 * /announcements/{id}:
 *   get:
 *     summary: Отримати оголошення за ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/:id', validator.getByIdValidator, controller.getAnnouncementById);

/**
 * @swagger
 * /announcements:
 *   post:
 *     summary: Створити нове оголошення
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, price, category, contactInfo]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *                 enum: [sale, service, job, other]
 *               contactInfo:
 *                 type: string
 */
router.post('/', authenticate, validator.createValidator, controller.createAnnouncement);

/**
 * @swagger
 * /announcements/{id}:
 *   patch:
 *     summary: Частково оновити оголошення
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               contactInfo:
 *                 type: string
 */
router.patch('/:id', authenticate, validator.updateValidator, controller.updateAnnouncement);

/**
 * @swagger
 * /announcements/{id}:
 *   delete:
 *     summary: Видалити оголошення
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.delete('/:id', authenticate, validator.deleteValidator, controller.deleteAnnouncement);

export default router;