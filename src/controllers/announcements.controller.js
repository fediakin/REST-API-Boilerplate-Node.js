import prisma from '../../prisma/client.js';

export const getAllAnnouncements = async (req, res) => {
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
};

export const getAnnouncementById = async (req, res) => {
  const id = Number(req.params.id);

  const announcement = await prisma.announcement.findUniqueOrThrow({
    where: { id }
  });
  res.json(announcement);
};

export const createAnnouncement = async (req, res) => {
  const announcement = await prisma.announcement.create({
    data: req.body
  });
  res.status(201).json(announcement);
};

export const updateAnnouncement = async (req, res) => {
  const id = Number(req.params.id);

  const announcement = await prisma.announcement.update({
    where: { id },
    data: req.body
  });
  res.json(announcement);
};

export const deleteAnnouncement = async (req, res) => {
  const id = Number(req.params.id);
  await prisma.announcement.delete({
    where: { id }
  });

  res.status(204).end();
};