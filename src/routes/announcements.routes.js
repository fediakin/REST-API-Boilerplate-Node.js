import express from 'express';
import * as controller from '../controllers/announcements.controller.js';
import * as validator from '../validators/announcements.validators.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /announcements:
 *   get:
 *     summary: Отримати список оголошень
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Пошук по назві
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest]
 *         description: Сортування за датою
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Номер сторінки
 *     responses:
 *       200:
 *         description: Успішний запит
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
 *     responses:
 *       200:
 *         description: Оголошення знайдено
 *       404:
 *         description: Не знайдено
 */
router.get('/:id', validator.getByIdValidator, controller.getAnnouncementById);

/**
 * @swagger
 * /announcements:
 *   post:
 *     summary: Створити нове оголошення (з можливістю додати фото)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
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
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Оголошення створено
 *       400:
 *         description: Помилка валідації
 *       401:
 *         description: Не авторизовано
 */
router.post('/', authenticate, upload.single('photo'), validator.createValidator, controller.createAnnouncement);

/**
 * @swagger
 * /announcements/{id}:
 *   patch:
 *     summary: Частково оновити оголошення (з можливістю оновити фото)
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
 *         multipart/form-data:
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
 *                 enum: [sale, service, job, other]
 *               contactInfo:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Успішно оновлено
 *       400:
 *         description: Помилка валідації
 *       401:
 *         description: Не авторизовано
 *       403:
 *         description: Заборонено (не власник)
 *       404:
 *         description: Не знайдено
 */
router.patch('/:id', authenticate, upload.single('photo'), validator.updateValidator, controller.updateAnnouncement);

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
 *     responses:
 *       204:
 *         description: Успішно видалено
 *       401:
 *         description: Не авторизовано
 *       403:
 *         description: Заборонено (не власник)
 *       404:
 *         description: Не знайдено
 */
router.delete('/:id', authenticate, validator.deleteValidator, controller.deleteAnnouncement);

export default router;