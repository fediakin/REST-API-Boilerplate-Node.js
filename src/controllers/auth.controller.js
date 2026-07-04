import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import prisma from '../../prisma/client.js';

const generateTokens = (user) => {
  const payload = { id: user.id, username: user.username };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export const register = async (req, res, next) => {
  try {
    const { username, password, name } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) throw createError(409, 'User with this username already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, name }
    });

    const { accessToken, refreshToken } = generateTokens(user);

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id }
    });

    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ user: userWithoutPassword, accessToken, refreshToken });
  } catch (error) { next(error); }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) throw createError(401, 'Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw createError(401, 'Invalid credentials');

    const { accessToken, refreshToken } = generateTokens(user);

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id }
    });

    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, accessToken, refreshToken });
  } catch (error) { next(error); }
};

export const refresh = async (req, res, next) => {
  try {
    const incomingToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingToken) throw createError(401, 'Refresh token required');

    const decoded = jwt.verify(incomingToken, process.env.JWT_REFRESH_SECRET);
    const storedToken = await prisma.refreshToken.findUnique({ where: { token: incomingToken } });
    if (!storedToken) throw createError(401, 'Invalid refresh token');

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    const { accessToken, refreshToken } = generateTokens(user);

    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id } });

    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ accessToken, refreshToken });
  } catch (error) { next(createError(401, 'Invalid or expired refresh token')); }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) { next(error); }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) throw createError(404, 'User not found');
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) { next(error); }
};