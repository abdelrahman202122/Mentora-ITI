import { TutorAvailabilityModel } from './tutor-availability.model.js';

export const create = async (data: Record<string, unknown>) => {
  return TutorAvailabilityModel.create(data);
};

export const findByTutorId = async (tutorId: string) => {
  return TutorAvailabilityModel.findOne({ tutorId }).lean();
};

export const replaceByTutorId = async (
  tutorId: string,
  data: Record<string, unknown>,
) => {
  return TutorAvailabilityModel.findOneAndUpdate(
    { tutorId },
    { $set: data },
    { new: true, runValidators: true },
  ).lean();
};
