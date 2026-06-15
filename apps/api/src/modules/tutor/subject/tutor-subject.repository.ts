import { TutorSubjectModel } from './tutor-subject.model.js';

export const create = async (data: Record<string, unknown>) => {
  return TutorSubjectModel.create(data);
};

export const findByTutorId = async (tutorId: string) => {
  return TutorSubjectModel.find({ tutorId }).sort({ createdAt: -1 }).lean();
};

export const findById = async (subjectId: string) => {
  return TutorSubjectModel.findById(subjectId).lean();
};

export const updateById = async (
  subjectId: string,
  data: Record<string, unknown>,
) => {
  return TutorSubjectModel.findByIdAndUpdate(
    subjectId,
    { $set: data },
    { new: true, runValidators: true },
  ).lean();
};

export const deleteById = async (subjectId: string) => {
  return TutorSubjectModel.findByIdAndDelete(subjectId).lean();
};
