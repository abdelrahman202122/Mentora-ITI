import jwt, { type SignOptions } from 'jsonwebtoken';

export const generateAccessToken = (
  userId: string,
  role: string
): string => {
  const options: SignOptions = {
    expiresIn: '15m',
  };

  return jwt.sign(
    { userId, role },
    process.env.JWT_ACCESS_SECRET!,
    options
  );
};

export const generateRefreshToken = (
  userId: string
): string => {
  const options: SignOptions = {
    expiresIn: '7d',
  };

  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET!,
    options
  );
};

export const verifyAccessToken = (
  token: string
) => {
  return jwt.verify(
    token,
    process.env.JWT_ACCESS_SECRET!
  );
};

export const verifyRefreshToken = (
  token: string
) => {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET!
  );
};