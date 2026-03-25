import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as UserModel from '../models/user';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, User } from '../types';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const JWT_EXPIRE_IN = process.env.JWT_EXPIRE_IN || '7d';

export const register = async (
  req: Request,
  res: Response<ApiResponse<User>>,
  next: NextFunction
) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return next(new AppError('Please provide username, email and password', 400));
    }

    const existingUserByEmail = await UserModel.findUserByEmail(email);
    if (existingUserByEmail) {
      return next(new AppError('User with this email already exists', 400));
    }

    const existingUserByUsername = await UserModel.findUserByUsername(username);
    if (existingUserByUsername) {
      return next(new AppError('Username already taken', 400));
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserModel.createUser(username, email, passwordHash);

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE_IN }
    );

    res.status(201).json({
      success: true,
      data: user,
      message: 'User registered successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response<ApiResponse<{ user: User; token: string }>>,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await UserModel.findUserByEmail(email);
    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    const isPasswordValid = await bcrypt.compare(password, (user as any).password_hash);
    if (!isPasswordValid) {
      return next(new AppError('Invalid credentials', 401));
    }

    const { password_hash, ...userWithoutPassword } = user;

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE_IN }
    );

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: any,
  res: Response<ApiResponse<User>>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    const user = await UserModel.findUserById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (
  req: any,
  res: Response<ApiResponse<void>>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return next(new AppError('Please provide current and new password', 400));
    }

    const user = await UserModel.findUserById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const userWithPassword = await UserModel.findUserByEmail((user as any).email);
    if (!userWithPassword) {
      return next(new AppError('User not found', 404));
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, (userWithPassword as any).password_hash);
    if (!isPasswordValid) {
      return next(new AppError('Current password is incorrect', 401));
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await UserModel.updatePassword(req.user.id, newPasswordHash);

    res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};
