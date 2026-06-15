import { Request, Response, NextFunction } from 'express';
import { AuditModel } from './audit.model.js';


export const getAudits = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (req.query.userId) filter.userId = req.query.userId;
    if (req.query.action) filter.action = req.query.action;

    const [audits, total] = await Promise.all([
      AuditModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      AuditModel.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: audits,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};