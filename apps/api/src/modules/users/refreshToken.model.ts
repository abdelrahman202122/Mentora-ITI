/* eslint-disable @typescript-eslint/consistent-type-imports */
// refreshToken.model.ts
import { Schema, model } from 'mongoose';
import { IRefreshToken } from './user.interface.js';



const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    token: {
      type:     String,
      required: true,
      unique:   true,
      index:    true,
    },
    userId: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },
    expiresAt: {
      type:     Date,
      required: true,
      // MongoDB TTL index — automatically purges expired documents
      index:    { expireAfterSeconds: 0 },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const RefreshTokenModel = model<IRefreshToken>(
  'RefreshToken',
  refreshTokenSchema
);