
const isProduction =
  process.env.NODE_ENV === 'production';

export const clearCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction
    ? ('none' as const)
    : ('lax' as const),
};

export const cookieOptions = {
  accessToken: {
    ...clearCookieOptions,
    maxAge: 15 * 60 * 1000,
  },

  refreshToken: {
    ...clearCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};
