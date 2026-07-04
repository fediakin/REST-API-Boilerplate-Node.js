import prisma from '../../prisma/client.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import logger from '../../src/logger.js';

// Налаштування Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getAllAnnouncements = async (req, res, next) => {
  try {
    const { search, sort = 'newest', page = 1 } = req.query;
    const pageNum = Number(page);
    const perPage = 10;
    const skip = (pageNum - 1) * perPage;

    const where = search ? { title: { contains: search } } : {};
    const orderBy = { createdAt: sort === 'oldest' ? 'asc' : 'desc' };

    const [data, total] = await Promise.all([
      prisma.announcement.findMany({ where, orderBy, skip, take: perPage }),
      prisma.announcement.count({ where })
    ]);

    res.json({
      data,
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / perPage),
        perPage
      }
    });
  } catch (error) { next(error); }
};

export const getAnnouncementById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const announcement = await prisma.announcement.findUniqueOrThrow({ where: { id } });
    res.json(announcement);
  } catch (error) { next(error); }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    let imageUrl = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'announcements' });
      imageUrl = result.secure_url;
      await fs.unlink(req.file.path); // Видаляємо локальний файл
      logger.info(`Photo uploaded to Cloudinary: ${imageUrl}`);
    }

    const announcement = await prisma.announcement.create({
      data: { ...req.body, price: Number(req.body.price), imageUrl, userId: req.user.id }
    });
    
    logger.info(`Announcement created with ID: ${announcement.id}`);
    res.status(201).json(announcement);
  } catch (error) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {}); // Очищення при помилці
    next(error);
  }
};

export const updateAnnouncement = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const announcement = await prisma.announcement.findUniqueOrThrow({ where: { id } });
    
    if (announcement.userId !== req.user.id) {
      if (req.file) await fs.unlink(req.file.path).catch(() => {});
      return res.status(403).json({ error: 'Access denied' });
    }

    let imageUrl = announcement.imageUrl;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'announcements' });
      imageUrl = result.secure_url;
      await fs.unlink(req.file.path);
      logger.info(`Updated photo for announcement ${id}`);
    }

    const updateData = { ...req.body };
    if (updateData.price) updateData.price = Number(updateData.price);
    updateData.imageUrl = imageUrl;

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id },
      data: updateData
    });
    res.json(updatedAnnouncement);
  } catch (error) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    next(error);
  }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const announcement = await prisma.announcement.findUniqueOrThrow({ where: { id } });
    
    if (announcement.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.announcement.delete({ where: { id } });
    res.status(204).end();
  } catch (error) { next(error); }
};