import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    startYear: { type: Number, required: true, min: 1900, max: 2100 },
    startMonth: { type: Number, required: true, min: 1, max: 12 },
    endYear: { type: Number, min: 1900, max: 2100 },
    endMonth: { type: Number, min: 1, max: 12 },
    isCurrent: { type: Boolean, default: false },
  },
  { _id: false },
);

experienceSchema.pre('validate', function (next) {
  if (this.endYear && this.endMonth && !this.isCurrent) {
    const start = new Date(this.startYear, this.startMonth - 1);
    const end = new Date(this.endYear, this.endMonth - 1);
    if (end < start) {
      next(new Error('End date must be after start date'));
      return;
    }
  }
  next();
});

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
      maxlength: 200,
      required: true,
    },

    bio: {
      type: String,
      maxlength: 500,
      required: true,
    },

    languages: {
      type: [String],
      required: true,
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
