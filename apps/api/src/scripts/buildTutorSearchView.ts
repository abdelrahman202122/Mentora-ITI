import mongoose from 'mongoose';
import { TutorSearchViewModel } from '../modules/tutor/search-view/tutor-search-view.model.js';
import { refreshAllTutorsSearchView } from '../modules/tutor/search-view/tutor-search-view.service.js';
import { env } from '../config/env.js';

/**
 * Builds the materialized view for tutor data
 * Run once on db setup/change
 */
async function main() {
  await mongoose.connect(env.MONGO_URI);
  console.log('Connected to MongoDB');

  // define userId as unique index
  await TutorSearchViewModel.collection.createIndex(
    { userId: 1 },
    { unique: true },
  );

  // removes tutors that no longer match the aggregation
  // e.g. inactive tutors, tutors whose profile was deleted, etc..
  await TutorSearchViewModel.deleteMany({});

  // Runs aggregation and writes fresh view documents.
  await refreshAllTutorsSearchView();

  const count = await TutorSearchViewModel.countDocuments();
  console.log(`Tutor search view built successfully. ${count} tutors indexed.`);
}

main()
  .catch(async (error) => {
    console.error('Tutor search view rebuild failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
