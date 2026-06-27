import { logger } from '../../../config/logger.js';
import { UserModel } from '../../users/user.model.js';
import { TutorProfileModel } from '../profile/tutor-profile.model.js';
import { TutorSubjectModel } from '../subject/tutor-subject.model.js';
import { refreshTutorSearchView } from './tutor-search-view.service.js';
import { TutorSearchViewModel } from './tutor-search-view.model.js';
import type { ChangeStream } from 'mongodb';

// Store active change stream watchers for graceful shutdown
const activeWatchers: ChangeStream[] = [];


export function startTutorSearchViewWatchers() {
  logger.info('Initializing Tutor Search View Real-Time Watchers...');

  // 1. Watch Tutor Profile Updates & Deletes
  const profileWatcher = TutorProfileModel.watch([], { fullDocument: 'updateLookup' });
  profileWatcher.on('change', async (change) => {
    try {
      if (
        change.operationType === 'insert' ||
        change.operationType === 'replace' ||
        change.operationType === 'update'
      ) {
        const tutorId = change.fullDocument?.userId;
        if (tutorId) {
          await refreshTutorSearchView(tutorId.toString());
        }
      } else if (change.operationType === 'delete') {
        // Use deleted profile _id to find owning tutor's document and trigger a refresh
        const profileId = change.documentKey._id;
        const tutor = await TutorSearchViewModel.findOne({
          'profile.id': profileId,
        });
        if (tutor) {
          await refreshTutorSearchView(tutor.userId.toString());
        }
      }
    } catch (error) {
      logger.error('Error processing TutorProfile change stream event:', error);
    }
  });
  profileWatcher.on('error', (err) => {
    logger.error('TutorProfile watcher error:', err);
  });
  activeWatchers.push(profileWatcher);


  // 2. Watch Tutor Subject Updates & Deletes
  const subjectWatcher = TutorSubjectModel.watch([], { fullDocument: 'updateLookup' });
  subjectWatcher.on('change', async (change) => {
    try {
      if (
        change.operationType === 'insert' ||
        change.operationType === 'replace' ||
        change.operationType === 'update'
      ) {
        const tutorId = change.fullDocument?.tutorId;
        if (tutorId) {
          await refreshTutorSearchView(tutorId.toString());
        }
      } else if (change.operationType === 'delete') {
        // Use deleted subject _id to find owning tutor's document and trigger a refresh
        const subjectId = change.documentKey._id;
        const tutor = await TutorSearchViewModel.findOne({
          'subjects.id': subjectId,
        });
        if (tutor) {
          await refreshTutorSearchView(tutor.userId.toString());
        }
      }
    } catch (error) {
      logger.error('Error processing TutorSubject change stream event:', error);
    }
  });
  subjectWatcher.on('error', (err) => {
    logger.error('TutorSubject watcher error:', err);
  });
  activeWatchers.push(subjectWatcher);


  // 3. Watch User Updates & Deletes (e.g., name or avatar updates, account deactivation/deletion)
  const userWatcher = UserModel.watch([], { fullDocument: 'updateLookup' });
  userWatcher.on('change', async (change) => {
    try {
      if (
        change.operationType === 'insert' ||
        change.operationType === 'replace' ||
        change.operationType === 'update'
      ) {
        const user = change.fullDocument;
        if (user) {
          if (user.role === 'tutor') {
            await refreshTutorSearchView(user._id.toString());
          } else {
            await TutorSearchViewModel.deleteOne({ userId: user._id });
          }
        }
      } else if (change.operationType === 'delete') {
        const userId = change.documentKey._id;
        await TutorSearchViewModel.deleteOne({ userId });
      }
    } catch (error) {
      logger.error('Error processing User change stream event:', error);
    }
  });
  userWatcher.on('error', (err) => {
    logger.error('User watcher error:', err);
  });
  activeWatchers.push(userWatcher);

}

// Gracefully stop all watchers
export async function stopTutorSearchViewWatchers(): Promise<void> {
  await Promise.all(
    activeWatchers.map(async (watcher) => {
      try {
        await watcher.close();
      } catch (e) {
        logger.error('Error closing watcher:', e);
      }
    }),
  );
  activeWatchers.length = 0;
}
