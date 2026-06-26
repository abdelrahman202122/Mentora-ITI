import mongoose, { type ClientSession } from 'mongoose';

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
    return await session.withTransaction(() => fn(session));
  } finally {
    await session.endSession();
  }
}
