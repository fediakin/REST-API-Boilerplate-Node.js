import prisma from '../../prisma/client.js';

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
    const announcement = await prisma.announcement.create({
      data: { ...req.body, userId: req.user.id }
    });
    res.status(201).json(announcement);
  } catch (error) { next(error); }
};

export const updateAnnouncement = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const announcement = await prisma.announcement.findUniqueOrThrow({ where: { id } });
    
    if (announcement.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id },
      data: req.body
    });
    res.json(updatedAnnouncement);
  } catch (error) { next(error); }
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