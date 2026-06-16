import { AuditModel } from './audit.model.js';
import { AuditAction } from './audit.interface.js';
import { logger } from '../../config/logger.js';

export const createAuditLog = async (
  userId: string,
  action: AuditAction,
  resource?: string,
  metadata?: Record<string, any>
) => {
  try {
    await AuditModel.create({
      userId,
      action,
      resource,
      metadata,
    });

    logger.info({
      event: 'audit.created',
      userId,
      action,
    });
  } catch (error) {
    // NEVER block main flow if audit fails
    logger.error({
      event: 'audit.failed',
      error,
    });
  }
};