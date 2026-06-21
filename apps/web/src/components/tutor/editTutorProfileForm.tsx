'use client'

import { Plus, Camera } from "lucide-react";
import CourseCard from "@/components/tutor/CourseCard";
import Field from "@/components/tutor/Field";
import Link from "next/link";
import { useTutorProfile } from "@/hooks/tutor/useTutorProfile";

export default function EditProfileForm({ tutorId }: { tutorId: string }) {
  const { data: tutorProfile, isLoading, error } = useTutorProfile(tutorId);

  if (isLoading) return <p>Loading...</p>;
  if (error || !tutorProfile) return <p>Something went wrong.</p>;

  const { headline, bio } = tutorProfile;

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

        {/* Profile Section */}
        <section className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-8">

            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group w-28 h-28">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2"
                  className="w-full h-full object-cover rounded-full border-4 border-border"
                />

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-full flex flex-col items-center justify-center text-white transition">
                  <Camera className="w-5 h-5" />
                  <span className="text-xs mt-1">Change</span>
                </div>
              </div>
            </div>

            {/* Fields */}
            <div className="flex-1 space-y-5">
              <div className="grid md:grid-cols-2 gap-5">

                <Field
                  label="Full Name"
                  defaultValue="Dr. Elena Rodriguez"
                />

                <Field
                  label="Professional Title"
                  defaultValue={headline}
                />

              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  About Me / Bio
                </label>

                <textarea
                  defaultValue={bio}
                  className="w-full mt-2 min-h-[120px] rounded-lg border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Courses */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Courses Offered</h2>

          <div className="grid md:grid-cols-2 gap-6">

            <CourseCard
              key="course-1"
              title="Advanced Cognitive Linguistics"
              rate="85"
              tag="Experience"
              idPrefix="1"
            />

            {/* Add New */}
            <button className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition">
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