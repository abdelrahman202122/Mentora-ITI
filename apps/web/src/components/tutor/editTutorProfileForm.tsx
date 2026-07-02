'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import CardForm from '@/components/tutor/CardForm';
import CourseCard from '@/components/tutor/CourseCard';
import TutorProfileForm from '@/components/tutor/TutorProfileForm';
import { Button } from '@/components/ui/button';
import { useTutorProfile } from '@/hooks/tutor/useTutorProfile';
import { useTutorSubjects } from '@/hooks/tutor/useTutorSubjects';

export default function EditProfileForm({ tutorId }: { tutorId: string }) {
  const t = useTranslations('editProfile');
  const [isOpen, setIsOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | undefined>(
    undefined,
  );
  const {
    data: tutorProfile,
    error: profileError,
    isLoading: isProfileLoading,
  } = useTutorProfile(tutorId);
  const {
    data: tutorSubjects,
    error: subjectsError,
    isLoading: isSubjectsLoading,
  } = useTutorSubjects(tutorId);

  if (isProfileLoading) {
    return <p className="text-sm text-muted-foreground">{t('loading')}</p>;
  }

  if (profileError || !tutorProfile) {
    return <p className="text-sm text-red-600">{t('error')}</p>;
  }

  const subjects = tutorSubjects || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10">
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('description')}</p>
        </header>

        <TutorProfileForm mode="update" data={tutorProfile} tutorId={tutorId} />

        <section className="space-y-6">
          <h2 className="text-2xl font-bold">{t('coursesOffered')}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {isSubjectsLoading && <p>{t('loadingCourses')}</p>}

            {subjectsError && (
              <p className="text-red-600">{t('coursesError')}</p>
            )}

            {!isSubjectsLoading &&
              !subjectsError &&
              subjects.map((subject) => (
                <CourseCard
                  key={subject._id}
                  course={subject}
                  onEdit={(id) => {
                    setEditingSubjectId(id);
                    setIsOpen(true);
                  }}
                />
              ))}

            {isOpen && (
              <CardForm
                subjectId={editingSubjectId}
                onClose={() => {
                  setIsOpen(false);
                  setEditingSubjectId(undefined);
                }}
              />
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(true)}
              className="h-auto min-h-40 flex-col gap-3 border-dashed p-8"
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Plus />
              </span>
              <span className="text-center">
                <span className="block font-bold">{t('addNewCourse')}</span>
                <span className="mt-1 block text-sm font-normal text-muted-foreground">
                  {t('addNewCourseDescription')}
                </span>
              </span>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
