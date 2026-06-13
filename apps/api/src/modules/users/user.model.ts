/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Schema, model} from 'mongoose';
import { IUser, UserRole } from './user.interface.js';
import { hashPassword } from '../../utils/hashPassword.js';

/**
 * User schema
 */
const userSchema = new Schema<IUser>(
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
      required: true
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
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for scalability
 */
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await hashPassword(this.password);

  next();
});

userSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as Record<string, unknown>;
  if (update?.password) {
    update.password = await hashPassword(update.password as string);
  }
  next();
});

export const UserModel = model<IUser>('User', userSchema);