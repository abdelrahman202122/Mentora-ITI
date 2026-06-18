import mongoose from 'mongoose';

import { env } from './env.js';

export async function connectDatabase() {
  mongoose.set('strictQuery', true);
  console.log('Connecting to MongoDB...');
  await mongoose.connect(env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log('MongoDB connected');
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  console.log('MongoDB disconnected');
}
