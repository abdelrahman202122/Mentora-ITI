import mongoose from 'mongoose';
import { TutorSearchViewModel } from '../modules/tutor/search-view/tutor-search-view.model.js';
import { env } from '../config/env.js';
import { definition } from '../config/searchIndex.js';

const INDEX_NAME = 'tutor_search';

/**
 * Creates search index if it doesn't already exist
 * Run once on db setup/change
 */
async function main() {
  await mongoose.connect(env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Checks if the search index already exists
  const existing = await TutorSearchViewModel.collection
    .listSearchIndexes(INDEX_NAME)
    .toArray();

  if (existing.length > 0) {
    console.log(`Search index "${INDEX_NAME}" already exists; skipping.`);
    return;
  }

  // Creates search index.
  await TutorSearchViewModel.collection.createSearchIndex({
    name: INDEX_NAME,
    definition,
  });

  console.log(`Started creating search index "${INDEX_NAME}".`);
}

main()
  .catch(async (error) => {
    console.error('Search index creation failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
