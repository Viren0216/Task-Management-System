import { Request, Response } from 'express';
import * as userService from '../services/userService';

export const getMe = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const data = await userService.getUserProfile(userId);
  
  res.status(200).json({
    status: 'success',
    data,
  });
};

export const updateMe = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const data = await userService.updateUserProfile(userId, req.body);
  
  res.status(200).json({
    status: 'success',
    data,
  });
};
