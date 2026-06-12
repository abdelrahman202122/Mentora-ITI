import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      required: true, // "HH:MM" 24h
    },
    endTime: {
      type: String,
      required: true, // "HH:MM" 24h
    },
  },
  { _id: false },
);

const slotsSchema = new mongoose.Schema(
  {
    monday: {
      type: [timeSlotSchema],
      default: [],
    },
    tuesday: {
      type: [timeSlotSchema],
      default: [],
    },
    wednesday: {
      type: [timeSlotSchema],
      default: [],
    },
    thursday: {
      type: [timeSlotSchema],
      default: [],
    },
    friday: {
      type: [timeSlotSchema],
      default: [],
    },
    saturday: {
      type: [timeSlotSchema],
      default: [],
    },
    sunday: {
      type: [timeSlotSchema],
      default: [],
    },
  },
  { _id: false },
);

const tutorAvailabilitySchema = new mongoose.Schema(
  {
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    slots: {
      type: slotsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: {
      createdAt: false,
      updatedAt: true,
    },
  },
);

// Raw schema type
export type TutorAvailability = mongoose.InferSchemaType<
  typeof tutorAvailabilitySchema
>;

// Hydrated mongoose document type
export type TutorAvailabilityDocument =
  mongoose.HydratedDocument<TutorAvailability>;

export const TutorAvailabilityModel =
  (mongoose.models.TutorAvailability as mongoose.Model<TutorAvailability>) ??
  mongoose.model<TutorAvailability>(
    'TutorAvailability',
    tutorAvailabilitySchema,
  );
