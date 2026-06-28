"use client";

import TutorProfileForm from '@/components/tutor/TutorProfileForm';
import { useCurrentUser } from '@/hooks/auth/use-auth';
import {  useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CreateProfilePage() {
  const { data: user, isLoading } = useCurrentUser();
const router = useRouter();
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user]);

//  if (!user) {
//     redirect("/login");
//   }==> if it server component

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold">Create Your Profile</h1>
            <p className="text-muted-foreground mt-1">
              Set up your tutor profile to start teaching students.
            </p>
          </div>
        </div>

<TutorProfileForm
  mode="create"
  data={{
    userData: {
      _id: user?.id ?? "",
      name: user?.name ?? "",
      avatar: user?.avatar ?? "",
    }
  }}
  tutorId={user?.id}
/>      </div>
    </div>
  );
}