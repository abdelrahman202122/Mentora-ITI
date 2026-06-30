
/* eslint-disable @typescript-eslint/consistent-type-imports */
import mongoose from 'mongoose';
import { IUser, UserRole } from './user.interface.js';
import { hashPassword } from '../../utils/hashPassword.js';

const { Schema, model } = mongoose;

/**
 * User schema
 */
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
    type: String,
    trim: true,
    default: null,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.LEARNER,
      required: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    avatar: {
      type: String,
    },

    tutorProfile: {
      type: Schema.Types.ObjectId,
      ref: 'TutorProfile',
      default: null,
    },
    passwordResetToken: {
      type: String,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
    },
    adminStatus: {
      type: String,
      enum: ['Active', 'Pending', 'Suspended'],
      default: 'Active',
    },

    roleLabel: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Indexes for scalability
 */
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ adminStatus: 1 });

/* ═══ YOUR EXISTING HOOK — password hashing (keep as-is) ═══ */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await hashPassword(this.password);

  next();
});

/* ═══ ✅ NEW HOOK — sync isActive with adminStatus ═══
   When adminStatus changes, automatically update isActive:
   - adminStatus = 'Active'    → isActive = true
   - adminStatus = 'Pending'   → isActive = false
   - adminStatus = 'Suspended' → isActive = false
   This keeps old code that checks isActive working correctly. */
userSchema.pre('save', function (next) {
  if (this.isModified('adminStatus')) {
    this.isActive = this.adminStatus === 'Active';
  }
  next();
});

userSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as Record<string, any> | null;
  if (!update) return next();

  // Flat form: findOneAndUpdate(filter, { password: '...' })
  if (update.password) {
    update.password = await hashPassword(update.password as string);
  }

  // Operator form: findOneAndUpdate(filter, { $set: { password: '...' } })
  if (update.$set?.password) {
    update.$set.password = await hashPassword(update.$set.password as string);
  }

  // Upsert form: findOneAndUpdate(filter, { $setOnInsert: { password: '...' } }, { upsert: true })
  if (update.$setOnInsert?.password) {
    update.$setOnInsert.password = await hashPassword(
      update.$setOnInsert.password as string,
    );
  }

  next();
});

export const UserModel = model<IUser>('User', userSchema);

