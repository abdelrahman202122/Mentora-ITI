import fs from 'node:fs';
import path from 'node:path';
import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { ValidationError } from '../common/errors/AppError.js';

// ensure the avatars directory exists
const avatarsDir = path.resolve(process.cwd(), 'uploads', 'avatars');

if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// configure multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, avatarsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

// avatar file filter and size limit
const imagefileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
    cb(new Error('Only JPEG, PNG, and WEBP images are allowed'));
    return;
  }

  cb(null, true);
};

const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: 3 * 1024 * 1024,
  },
  fileFilter: imagefileFilter,
});

/*
 * Wrapper for uploadAvatar.single('avatar').
 * Handles avatar uploads and converts Multer upload errors
 * into application ValidationErrors.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function in the stack.
 */
export const uploadAvatarMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  uploadAvatar.single('avatar')(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        next(new ValidationError('Avatar file must be 3MB or less'));
        return;
      }
      next(new ValidationError(error.message));
      return;
    }

    if (error instanceof Error) {
      next(new ValidationError(error.message));
      return;
    }

    next();
  });
};
