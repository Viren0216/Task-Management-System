// Import direct repositories
import * as userRepository from '../repositories/userRepository';
import * as tokenRepository from '../repositories/tokenRepository';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { ConflictError } from '../errors/ConflictError';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { NotFoundError } from '../errors/NotFoundError';
import { config } from '../config';

export const registerUser = async (data: any) => {
  const existingUser = await userRepository.findUserByEmail(data.email);
  if (existingUser) {
    throw new ConflictError('Email already in use');
  }

  const hashedPassword = await hashPassword(data.password);
  
  const user = await userRepository.createUser({
    name: data.name,
    email: data.email,
    passwordHash: hashedPassword,
    avatar: data.avatar,
  });

  const payload = { userId: user.id, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Default expiration to 7 days from now matching jwt config, we can calculate precisely or just add 7 days.
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const hashedRefreshToken = await hashPassword(refreshToken);

  await tokenRepository.createRefreshToken({
    token: hashedRefreshToken,
    userId: user.id,
    expiresAt,
  });

  // Exclude passwordHash from returned user object
  const { passwordHash, ...userWithoutPassword } = user;
  
  return { user: userWithoutPassword, accessToken, refreshToken };
};

export const loginUser = async (data: any) => {
  const user = await userRepository.findUserByEmail(data.email);
  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const isPasswordValid = await comparePassword(data.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const payload = { userId: user.id, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const hashedRefreshToken = await hashPassword(refreshToken);

  await tokenRepository.createRefreshToken({
    token: hashedRefreshToken,
    userId: user.id,
    expiresAt,
  });

  const { passwordHash, ...userWithoutPassword } = user;
  
  return { user: userWithoutPassword, accessToken, refreshToken };
};

export const refreshAuthTokens = async (token: string) => {
  try {
    const decoded = verifyRefreshToken(token);
    const savedTokens = await tokenRepository.findRefreshTokensByUserId(decoded.userId);

    let matchingToken = null;
    for (const st of savedTokens) {
      if (await comparePassword(token, st.token)) {
        matchingToken = st;
        break;
      }
    }

    if (!matchingToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Optional: invalidate old refresh token via token rotation (delete old and issue new)
    await tokenRepository.deleteRefreshTokenById(matchingToken.id);

    const payload = { userId: matchingToken.user.id, role: matchingToken.user.role };
    const accessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const hashedNewRefreshToken = await hashPassword(newRefreshToken);

    await tokenRepository.createRefreshToken({
      token: hashedNewRefreshToken,
      userId: matchingToken.userId,
      expiresAt,
    });

    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw new UnauthorizedError('Invalid refresh token');
  }
};

export const logoutUser = async (token: string) => {
  try {
    const decoded = verifyRefreshToken(token);
    const savedTokens = await tokenRepository.findRefreshTokensByUserId(decoded.userId);
    
    for (const st of savedTokens) {
      if (await comparePassword(token, st.token)) {
        await tokenRepository.deleteRefreshTokenById(st.id);
        break;
      }
    }
  } catch (error) {
    // If the token is already expired or invalid, we can safely ignore the logout error
  }
};

export const changeUserPassword = async (userId: string, data: any) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const isPasswordValid = await comparePassword(data.currentPassword, user.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid current password');
  }

  const newHashedPassword = await hashPassword(data.newPassword);
  await userRepository.updatePassword(userId, newHashedPassword);
  
  // Optionally invalidate all other access by destroying all refresh tokens
  await tokenRepository.deleteRefreshTokensForUser(userId);
};
