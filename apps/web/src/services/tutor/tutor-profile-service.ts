import type { TutorProfileData } from '@/types/tutor/tutor-profile';
import tutorProfileFixture from '@/mocks/tutor-profile.json';

export async function getTutorProfile(
  tutorId: string,
): Promise<TutorProfileData> {
  const profile = tutorProfileFixture.data as TutorProfileData;

  if (profile._id !== tutorId) {
    throw new Error(`Tutor profile ${tutorId} was not found`);
  }

  return profile;
}
