import mongoose from 'mongoose';

const subjectViewSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    title: { type: String, required: true },
    category: { type: String, required: true },
    educationLevel: { type: String, required: true },
    curriculum: { type: String, required: true },
    gradeNote: { type: String },
    description: { type: String },
  },
  {
    _id: false,
  },
);

const experienceViewSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    startYear: { type: Number, required: true },
    startMonth: { type: Number, required: true },
    endYear: Number,
    endMonth: Number,
    isCurrent: Boolean,
  },
  { _id: false },
);

const educationViewSchema = new mongoose.Schema(
  {
    degree: { type: String, required: true },
    field: { type: String, required: true },
    institution: { type: String, required: true },
    graduationYear: Number,
  },
  { _id: false },
);

const profileViewSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    bio: { type: String, required: true },
    headline: { type: String, required: true },
    hourlyRate: { type: Number, required: true },
    languages: { type: [String], required: true },
    rating: Number,
    totalReviews: Number,
    education: [educationViewSchema],
    experience: [experienceViewSchema],
    isAvailable: Boolean,
    status: String,
  },
  {
    _id: false,
  },
);

const tutorSearchViewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
    },

    name: { type: String, required: true },
    avatar: String,
    isEmailVerified: Boolean,
    isActive: Boolean,

    profile: {
      type: profileViewSchema,
      required: true,
    },

    subjects: {
      type: [subjectViewSchema],
      default: [],
    },
  },
  {
    collection: 'tutor_search_view',
    versionKey: false,
    timestamps: false,
  },
);

// indexes for common search filters/sorts.
tutorSearchViewSchema.index({ 'profile.hourlyRate': 1 });
tutorSearchViewSchema.index({ 'profile.rating': -1 });
tutorSearchViewSchema.index({ 'subjects.category': 1 });
tutorSearchViewSchema.index({ 'subjects.educationLevel': 1 });
tutorSearchViewSchema.index({ 'subjects.curriculum': 1 });
// tutorSearchViewSchema.index({ 'profile.isAvailable': 1 });

export type TutorSearchView = mongoose.InferSchemaType<
  typeof tutorSearchViewSchema
>;

export const TutorSearchViewModel =
  (mongoose.models.TutorSearchView as mongoose.Model<TutorSearchView>) ||
  mongoose.model<TutorSearchView>('TutorSearchView', tutorSearchViewSchema);
