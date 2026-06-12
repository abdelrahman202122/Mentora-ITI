import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    startDate: { type: String, required: true }, // "MM/YYYY"
    endDate: { type: String, default: null }, // null = present
  },
  { _id: false },
);

const educationSchema = new mongoose.Schema(
  {
    degree: { type: String, required: true },
    field: { type: String, required: true },
    institution: { type: String, required: true },
    graduationYear: { type: Number },
  },
  { _id: false },
);

const tutorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    headline: {
      type: String,
      maxlength: 500,
      default: null,
    },

    bio: {
      type: String,
      maxlength: 500,
      default: null,
    },

    languages: {
      type: [String],
      default: [],
    },

    experience: {
      type: [experienceSchema],
      default: [],
    },

    education: {
      type: [educationSchema],
      default: [],
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

tutorProfileSchema.index({ rating: -1 });

// Raw schema type
export type TutorProfile = mongoose.InferSchemaType<typeof tutorProfileSchema>;

// Hydrated mongoose document type
export type TutorProfileDocument = mongoose.HydratedDocument<TutorProfile>;

export const TutorProfileModel =
  (mongoose.models.TutorProfile as mongoose.Model<TutorProfile>) ||
  mongoose.model<TutorProfile>('TutorProfile', tutorProfileSchema);
