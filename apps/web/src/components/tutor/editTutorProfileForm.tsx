'use client';
import { Plus, Camera } from 'lucide-react';
import CourseCard from '@/components/tutor/CourseCard';
import Field from '@/components/tutor/Field';
import Link from 'next/link';
import { useTutorProfile } from '@/hooks/tutor/useTutorProfile';
import { useCurrentUser } from '@/hooks/auth/use-auth';
import { useTutorSubjects } from '@/hooks/tutor/useTutorSubjects';
import CardForm from '@/components/tutor/CardForm';
import { useState } from 'react';
import TutorProfileForm from "@/components/tutor/TutorProfileForm";
export default function EditProfileForm({ tutorId }: { tutorId: string }) {
const [isOpen, setIsOpen] = useState(false);
const [editingSubjectId, setEditingSubjectId] = useState<string | undefined>(undefined);


  const { data: user } = useCurrentUser();
  const {
    data: tutorProfile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useTutorProfile(tutorId);
  const {
    data: tutorSubjects,
    isLoading: isSubjectsLoading,
    error: subjectsError,
  } = useTutorSubjects(tutorId);

  if (isProfileLoading) return <p>Loading...</p>;
  if (profileError || !tutorProfile) return <p>Something went wrong.</p>;
  const { headline, bio, hourlyRate } = tutorProfile;
  const subjects = tutorSubjects || [];
  const rateId = `${tutorId}-hourly-rate`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold">Edit Profile</h1>
            <p className="text-muted-foreground mt-1">
              Update your professional identity and manage your curriculum.
            </p>
          </div>

          <div className="flex gap-3">
            <button className="btn-outline">Discard Changes</button>
            <button className="btn-primary">Save Profile</button>
          </div>
        </div>

        <TutorProfileForm data={tutorProfile} />
        {/* Courses */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Courses Offered</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {isSubjectsLoading && <p>Loading courses...</p>}

            {subjectsError && (
              <p className="text-red-500">
                {' '}
                couldn`t load courses. Try again later.
              </p>
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
            {/* {isOpen && <CardForm onClose={() => setIsOpen(false)} />} */}
            {isOpen && (
              <CardForm
                subjectId={editingSubjectId}
                onClose={() => {
                  setIsOpen(false);
                  setEditingSubjectId(undefined);
                }}
              />
            )}

            {/* Add New */}
            <button 
              onClick={() => setIsOpen(true)}
              className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Plus />
              </div>
              <div className="text-center">
                <p className="font-bold">Add New Course</p>
                <p className="text-sm text-muted-foreground">
                  List a new subject to start teaching more students.
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t pt-6 text-sm text-muted-foreground flex flex-col md:flex-row justify-between gap-4">
          <span>© {new Date().getFullYear()} EduMarket Inc.</span>

          <div className="flex gap-6">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/help">Help</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}



