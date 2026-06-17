import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';
import { notFoundHandler } from './middleware/not-found.middleware.js';
import bookingRoutes from './modules/bookings/booking.routes.js';
import healthRoutes from './modules/health/health.routes.js';
import { httpLogger } from './middleware/logger.middleware.js';
import userRoutes from './modules/users/user.route.js';
import tutorRoutes from './modules/tutor/tutor.routes.js';
import auditRouter from './modules/audit/audit.route.js';
import filesRouter from './modules/files/file.routes.js';

export function createApp() {
  const app = express();

  app.use(httpLogger);

  app.disable('x-powered-by');
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );
  app.use(compression());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  app.use('/api/users', userRoutes);
  app.use('/api/tutors', tutorRoutes);
  app.use('/api/health', healthRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/audits', auditRouter);
  app.use('/api/files', filesRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
