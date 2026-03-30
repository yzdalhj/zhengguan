import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import * as UserModel from '../models/user';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, User } from '../types';
import type { AuthRequest } from '../middleware/auth';

export const register = async (
  req: Request,
  res: Response<ApiResponse<User>>,
  next: NextFunction
) => {
  try {
    const { username, email, password, phone } = req.body;

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

    if (phone) {
      const existingUserByPhone = await UserModel.findUserByPhone(phone);
      if (existingUserByPhone) {
        return next(new AppError('User with this phone already exists', 400));
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserModel.createUser(username, email, passwordHash, 'user', phone);

    const token = generateToken(user);

    const { password_hash, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      data: userWithoutPassword as User,
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

    const isPasswordValid = await bcrypt.compare(password, user.password_hash!);
    if (!isPasswordValid) {
      return next(new AppError('Invalid credentials', 401));
    }

    const { password_hash, ...userWithoutPassword } = user;

    const token = generateToken(user);

    res.json({
      success: true,
      data: {
        user: userWithoutPassword as User,
        token,
      },
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
};

export const loginByPhone = async (
  req: Request,
  res: Response<ApiResponse<{ user: User; token: string }>>,
  next: NextFunction
) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return next(new AppError('Please provide phone and password', 400));
    }

    const user = await UserModel.findUserByPhone(phone);
    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash!);
    if (!isPasswordValid) {
      return next(new AppError('Invalid credentials', 401));
    }

    const { password_hash, ...userWithoutPassword } = user;

    const token = generateToken(user);

    res.json({
      success: true,
      data: {
        user: userWithoutPassword as User,
        token,
      },
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
};

export const loginBySms = async (
  req: Request,
  res: Response<ApiResponse<{ user: User; token: string }>>,
  next: NextFunction
) => {
  try {
    return next(new AppError('SMS login not implemented yet', 501));
  } catch (error) {
    next(error);
  }
};

export const sendSmsCode = async (
  req: Request,
  res: Response<ApiResponse<void>>,
  next: NextFunction
) => {
  try {
    return next(new AppError('SMS sending not implemented yet', 501));
  } catch (error) {
    next(error);
  }
};

export const generateQrcode = async (
  req: Request,
  res: Response<ApiResponse<{ code: string; expires_at: Date }>>,
  next: NextFunction
) => {
  try {
    return next(new AppError('QR code login not implemented yet', 501));
  } catch (error) {
    next(error);
  }
};

export const checkQrcode = async (
  req: Request,
  res: Response<ApiResponse<{ user?: User; token?: string; status: string }>>,
  next: NextFunction
) => {
  try {
    return next(new AppError('QR code login not implemented yet', 501));
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: AuthRequest,
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
  req: AuthRequest,
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

    const userWithPassword = await UserModel.findUserByEmail(user.email!);
    if (!userWithPassword) {
      return next(new AppError('User not found', 404));
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, userWithPassword.password_hash!);
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
