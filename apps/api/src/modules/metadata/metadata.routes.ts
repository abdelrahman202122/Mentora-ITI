import { Router } from 'express';
import {
  getCategories,
  getCurricula,
  getEducationLevels,
} from './metadata.controller.js';

const router = Router();

router.get('/categories', getCategories);
router.get('/education-levels', getEducationLevels);
router.get('/curricula', getCurricula);

export default router;
