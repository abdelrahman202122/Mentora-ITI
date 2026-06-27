import { logger } from '../../../config/logger.js';
import { UserModel } from '../../users/user.model.js';
import { TutorProfileModel } from '../profile/tutor-profile.model.js';
import { TutorSubjectModel } from '../subject/tutor-subject.model.js';
import { refreshTutorSearchView } from './tutor-search-view.service.js';
import { TutorSearchViewModel } from './tutor-search-view.model.js';

export function startTutorSearchViewWatchers() {
  logger.info('Initializing Tutor Search View Real-Time Watchers...');

  // 1. Watch Tutor Profile Updates & Deletes
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
        logger.error(
          'Error processing TutorProfile change stream event:',
          error,
        );
      }
    },
  );

  // 2. Watch Tutor Subject Updates & Deletes
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
        logger.error(
          'Error processing TutorSubject change stream event:',
          error,
        );
      }
    },
  );

  // 3. Watch User Updates & Deletes (e.g., name or avatar updates, account deactivation/deletion)
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
    },
  );
}
