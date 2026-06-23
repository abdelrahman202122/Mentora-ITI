/* eslint-disable @typescript-eslint/consistent-type-imports */
import mongoose from 'mongoose';
import { IUser, UserRole } from './user.interface.js';
import { hashPassword } from '../../utils/hashPassword.js';

const { Schema, model } = mongoose;

/**

User schema
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
  passwordResetToken: {
    type: String,
    default: null,
  },

  passwordResetExpires: {
    type: Date,
    default: null,
  },
  },
  {
    timestamps: true,
  }
);

/**

Indexes for scalability
*/
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

userSchema.pre('save', async function (next) {
if (!this.isModified('password')) return next();

this.password = await hashPassword(this.password);

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
update.$setOnInsert.password = await hashPassword(update.$setOnInsert.password as string);
}

next();
});

export const UserModel = model('User', userSchema);