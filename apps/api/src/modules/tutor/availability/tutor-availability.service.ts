import {
  ConflictError,
  NotFoundError,
} from '../../../common/errors/AppError.js';
import { type CreateTutorAvailabilityInput } from '../../../validators/tutor-availability.js';
import {
  findByTutorId,
  create,
  replaceByTutorId,
} from './tutor-availability.repository.js';

export const getAvailability = async (tutorId: string) => {
  const availability = await findByTutorId(tutorId);

  if (!availability) {
    throw new NotFoundError('Tutor availability not found');
  }

  return availability;
};

export const createAvailability = async (
  userId: string,
  data: CreateTutorAvailabilityInput,
) => {
  const existingAvailability = await findByTutorId(userId);

  if (existingAvailability) {
    throw new ConflictError('Tutor availability already exists');
  }

  return create({ tutorId: userId, slots: data.slots ?? {} });
};

export const replaceAvailability = async (
  userId: string,
  data: CreateTutorAvailabilityInput,
) => {
  const existingAvailability = await findByTutorId(userId);

  if (!existingAvailability) {
    throw new NotFoundError('Tutor availability not found');
  }

  const updated = await replaceByTutorId(userId, { slots: data.slots ?? {} });

  if (!updated) {
    throw new NotFoundError('Tutor availability not found');
  }

  return updated;
};
