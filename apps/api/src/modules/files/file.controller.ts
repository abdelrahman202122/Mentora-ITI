import fs from 'node:fs';
import path from 'node:path';
import type { Request, Response } from 'express';
import { sendError } from '../../utils/api-response.js';

export const getAvatarFile = (req: Request, res: Response) => {
  const filename = req.params.filename;
  // console.log('filename:', filename);

  if (!filename || typeof filename !== 'string') {
    return sendError(res, 400, 'Invalid filename parameter');
  }

  const basename = path.basename(filename); // santize the filename to prevent directory traversal attacks
  const filePath = path.resolve(process.cwd(), 'uploads/avatars', basename);

  if (!filePath || !fs.existsSync(filePath)) {
    return sendError(res, 404, 'File not found');
  }

  return res.sendFile(filePath);
};
