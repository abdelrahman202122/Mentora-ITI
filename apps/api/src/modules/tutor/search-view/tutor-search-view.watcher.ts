import { logger } from '../../../config/logger.js';
import { UserModel } from '../../users/user.model.js';
import { TutorProfileModel } from '../profile/tutor-profile.model.js';
import { TutorSubjectModel } from '../subject/tutor-subject.model.js';
import { refreshTutorSearchView } from './tutor-search-view.service.js';

export function startTutorSearchViewWatchers() {
  logger.info('Initializing Tutor Search View Real-Time Watchers...');

  // 1. Watch Tutor Profile Updates
  TutorProfileModel.watch([], { fullDocument: 'updateLookup' }).on(
    'change',
    async (change) => {
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
        }
      } catch (error) {
        logger.error(
          'Error processing TutorProfile change stream event:',
          error,
        );
      }
    },
  );

  // 2. Watch Tutor Subject Updates
  TutorSubjectModel.watch([], { fullDocument: 'updateLookup' }).on(
    'change',
    async (change) => {
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
        }
      } catch (error) {
        logger.error(
          'Error processing TutorSubject change stream event:',
          error,
        );
      }
    },
  );

  // 3. Watch User Updates (e.g., name or avatar updates)
  UserModel.watch([], { fullDocument: 'updateLookup' }).on(
    'change',
    async (change) => {
      try {
        if (
          change.operationType === 'insert' ||
          change.operationType === 'replace' ||
          change.operationType === 'update'
        ) {
          const user = change.fullDocument;
          if (user && user.role === 'tutor') {
            await refreshTutorSearchView(user._id.toString());
          }
        }
      } catch (error) {
        logger.error('Error processing User change stream event:', error);
      }
    },
  );
}
