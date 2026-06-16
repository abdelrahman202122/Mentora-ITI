
const isProduction =
  process.env.NODE_ENV === 'production';

export const cookieOptions = {
  accessToken: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction
      ? ('none' as const)
      : ('lax' as const),
    maxAge: 15 * 60 * 1000,
  },

  refreshToken: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction
      ? ('none' as const)
      : ('lax' as const),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};