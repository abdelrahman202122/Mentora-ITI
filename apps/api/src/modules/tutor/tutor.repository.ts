import { TutorSearchViewModel } from './search-view/tutor-search-view.model.js';

export const findAll = async () => {
  return TutorSearchViewModel.find().lean();
};
