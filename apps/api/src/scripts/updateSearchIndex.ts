import mongoose from 'mongoose';
import { TutorSearchViewModel } from '../modules/tutor/search-view/tutor-search-view.model.js';
import { env } from '../config/env.js';
import { definition } from '../config/searchIndex.js';

const INDEX_NAME = 'tutor_search';

/**
 * Update search index definition
 * Run if index definition changed only
 */
async function main() {
  await mongoose.connect(env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Checks if the search index already exists
  const existing = await TutorSearchViewModel.collection
    .listSearchIndexes(INDEX_NAME)
    .toArray();

  if (existing.length === 0) {
    console.log(
      `Search index "${INDEX_NAME}" does not exist. Run the create script first.`,
    );
    return;
  }

  // Updates search index
  await TutorSearchViewModel.collection.updateSearchIndex(
    INDEX_NAME,
    definition,
  );

  console.log(`Started updating search index "${INDEX_NAME}".`);
}

main()
  .catch(async (error) => {
    console.error('Search index update failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
