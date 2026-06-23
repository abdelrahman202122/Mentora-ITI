import mongoose from 'mongoose';

import { EDUCATION_LEVEL_VALUES } from '../../../constants/educationLevels.js';
import { CATEGORY_VALUES } from '../../../constants/categories.js';
import { CURRICULA_VALUES } from '../../../constants/curricula.js';

const tutorSubjectSchema = new mongoose.Schema(
  {
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    category: {
      type: String,
      enum: CATEGORY_VALUES,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      maxlength: 1000,
      default: null,
    },

    educationLevel: {
      type: String,
      enum: EDUCATION_LEVEL_VALUES,
      required: true,
    },

    curriculum: {
      type: String,
      enum: CURRICULA_VALUES,
      required: true,
    },

    gradeNote: {
      type: String,
      maxlength: 100,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export type TutorSubject = mongoose.InferSchemaType<typeof tutorSubjectSchema>;

export type TutorSubjectDocument = mongoose.HydratedDocument<TutorSubject>;

export const TutorSubjectModel =
  (mongoose.models.TutorSubject as mongoose.Model<TutorSubject>) ??
  mongoose.model<TutorSubject>('TutorSubject', tutorSubjectSchema);
