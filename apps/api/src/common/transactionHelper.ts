import mongoose, { type ClientSession } from 'mongoose';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

/**
 * Executes the provided callback within a MongoDB transaction.
 *
 * @template T - The type of value returned by the callback.
 * @param fn - An asynchronous function that receives the transaction session and
 * performs one or more database operations.
 * @returns The value returned by the callback if the transaction commits successfully.
 * @throws Rethrows any error thrown by the callback after the transaction is aborted.
 */
export async function withTransaction<T>(
  fn: (session: ClientSession) => Promise<T>,
): Promise<T> {
  const session = await mongoose.startSession();

  try {
    if (!env.TRANSACTIONS_ENABLED) {
      logger.warn(
        'Transactions are disabled. Running without transactional guarantees.',
      );

      return await fn(session);
    }

    return await session.withTransaction(() => fn(session));
  } finally {
    await session.endSession();
  }
}
