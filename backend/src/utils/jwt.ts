import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import type { User } from '../types';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export interface JwtPayload {
  id: number;
  username: string;
  role: string;
}

export const generateToken = (user: User): string => {
  const payload: JwtPayload = {
    id: user.id,
    username: user.username,
    role: user.role,
  };

  const expiresIn = process.env.JWT_EXPIRE_IN || '7d';

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: expiresIn as any,
  });
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
};

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    return null;
  }
};
