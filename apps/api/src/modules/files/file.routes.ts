import { Router } from 'express';
import { getAvatarFile } from './file.controller.js';

const router = Router();

router.get('/avatars/:filename', getAvatarFile);

export default router;
