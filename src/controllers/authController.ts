import { Request, Response } from 'express';
import * as authService from '../services/authService';

export const register = async (req: Request, res: Response) => {
  const data = await authService.registerUser(req.body);
  res.status(201).json({
    status: 'success',
    data,
  });
};

export const login = async (req: Request, res: Response) => {
  const data = await authService.loginUser(req.body);
  res.status(200).json({
    status: 'success',
    data,
  });
};

export const refresh = async (req: Request, res: Response) => {
  const data = await authService.refreshAuthTokens(req.body.refreshToken);
  res.status(200).json({
    status: 'success',
    data,
  });
};

export const logout = async (req: Request, res: Response) => {
  // If we require auth for logout, we could pull refresh token from somewhere safe.
  // Assuming the client passes the refresh token in the body specifically to invalidate it.
  const { refreshToken } = req.body;
  if (refreshToken) {
    await authService.logoutUser(refreshToken);
  }
  
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};

export const changePassword = async (req: Request, res: Response) => {
  // Assuming auth middleware populated req.user
  const userId = (req as any).user.userId;
  await authService.changeUserPassword(userId, req.body);

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully',
  });
};
