import mongoose from 'mongoose';

import { env } from './env.js';

export async function connectDatabase() {
  mongoose.set('autoIndex', process.env.NODE_ENV !== 'production');
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGO_URI);
  console.log('MongoDB connected');
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  console.log('MongoDB disconnected');
}
