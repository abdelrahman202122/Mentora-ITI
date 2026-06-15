import { Schema, model } from 'mongoose';
import { IAudit, AuditAction } from './audit.interface.js';

const auditSchema = new Schema<IAudit>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    action: {
      type: String,
      enum: Object.values(AuditAction),
      required: true,

    },

    resource: {
      type: String,
    },

    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

auditSchema.index({ userId: 1, createdAt: -1 });
auditSchema.index({ action: 1 });

export const AuditModel = model<IAudit>('Audit', auditSchema);