'use client';

import { TutorProfileData, Experience, Education } from '@/types/tutor/tutor-profile';
import { Camera, GraduationCap, Briefcase, Languages, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const MONTHS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

export default function TutorProfileForm({ data }: { data: TutorProfileData }) {
  const [educationList, setEducationList] = useState<Education[]>(data?.education || []);
  const [experienceList, setExperienceList] = useState<Experience[]>(data?.experience || []);

  const [newEducation, setNewEducation] = useState({
    degree: '',
    field: '',
    institution: '',
    graduationYear: '',
  });

  const [newExperience, setNewExperience] = useState({
    title: '',
    startYear: '',
    startMonth: '',
    endYear: '',
    endMonth: '',
    isCurrent: false,
  });

  // ===== Add Education =====
  const addEducation = () => {
    if (!newEducation.degree || !newEducation.institution) return; // Basic validation
    setEducationList([
      ...educationList,
      {
        ...newEducation,
        graduationYear: Number(newEducation.graduationYear),
      },
    ]);
    // Reset state
    setNewEducation({ degree: '', field: '', institution: '', graduationYear: '' });
  };

  // ===== Remove Education =====
  const removeEducation = (indexToRemove: number) => {
    setEducationList(educationList.filter((_, index) => index !== indexToRemove));
  };

  // ===== Add Experience =====
  const addExperience = () => {
    if (!newExperience.title) return; // Basic validation
    setExperienceList([
      ...experienceList,
      {
        ...newExperience,
        startYear: Number(newExperience.startYear),
        startMonth: Number(newExperience.startMonth),
        endYear: newExperience.endYear ? Number(newExperience.endYear) : null,
        endMonth: newExperience.endMonth ? Number(newExperience.endMonth) : null,
      },
    ]);

    // Reset state
    setNewExperience({
      title: '',
      startYear: '',
      startMonth: '',
      endYear: '',
      endMonth: '',
      isCurrent: false,
    });
  };

  // ===== Remove Experience =====
  const removeExperience = (indexToRemove: number) => {
    setExperienceList(experienceList.filter((_, index) => index !== indexToRemove));
  };

  return (
    <section className="space-y-8 bg-card border border-border rounded-2xl p-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative group w-32 h-32">
            <img
              src={
                data?.userData?.avatar
                  ? `/uploads/${data.userData.avatar}`
                  : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2'
              }
              className="w-full h-full rounded-full object-cover border-4 border-border"
              alt="Avatar"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center text-white cursor-pointer">
              <Camera />
            </div>
          </div>
        </div>

        {/* BASIC INFO */}
        <div className="flex-1 space-y-4">
          <input
            defaultValue={data?.userData?.name}
            className="w-full p-3 border rounded-lg"
            placeholder="Full Name"
          />
          <input
            defaultValue={data?.headline}
            className="w-full p-3 border rounded-lg"
            placeholder="Headline"
          />
          <textarea
            defaultValue={data?.bio}
            className="w-full p-3 border rounded-lg min-h-[120px]"
            placeholder="Bio"
          />
          <input
            type="number"
            defaultValue={data?.hourlyRate}
            className="w-40 p-3 border rounded-lg"
            placeholder="Hourly Rate"
          />
        </div>
      </div>

      {/* ===== LANGUAGES ===== */}
      <div className="border p-4 rounded-xl">
        <h3 className="flex items-center gap-2 font-semibold mb-2">
          <Languages className="w-4 h-4" />
          Languages
        </h3>
        <input
          defaultValue={data?.languages?.join(', ')}
          className="w-full p-3 border rounded-lg"
          placeholder="e.g. English, Spanish"
        />
      </div>

      {/* ===== EDUCATION ===== */}
      <div className="border p-4 rounded-xl space-y-4">
        <h3 className="flex items-center gap-2 font-semibold">
          <GraduationCap className="w-4 h-4" />
          Education
        </h3>

        {/* Rendered List */}
        {educationList.map((edu: Education, index: number) => (
          <div key={index} className="flex items-center gap-2 border p-3 rounded-lg bg-slate-50/50">
            <div className="grid md:grid-cols-2 gap-2 flex-1">
              <input defaultValue={edu.degree} className="p-2 border rounded bg-white" placeholder="Degree" />
              <input defaultValue={edu.field} className="p-2 border rounded bg-white" placeholder="Field" />
              <input defaultValue={edu.institution} className="p-2 border rounded bg-white" placeholder="Institution" />
              <input defaultValue={edu.graduationYear || ''} className="p-2 border rounded bg-white" placeholder="Year" />
            </div>
            <button
              type="button"
              onClick={() => removeEducation(index)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
              title="Remove Education"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}

        {/* ADD EDUCATION FORM */}
        <div className="grid md:grid-cols-2 gap-2 border-t pt-4">
          <input
            placeholder="Degree"
            value={newEducation.degree}
            onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            placeholder="Field"
            value={newEducation.field}
            onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            placeholder="Institution"
            value={newEducation.institution}
            onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            placeholder="Year"
            value={newEducation.graduationYear}
            onChange={(e) => setNewEducation({ ...newEducation, graduationYear: e.target.value })}
            className="p-2 border rounded"
          />
          <button
            type="button"
            onClick={addEducation}
            className="col-span-2 flex items-center justify-center gap-2 bg-primary text-white p-2 rounded-lg hover:opacity-90 transition"
          >
            <Plus className="w-4 h-4" />
            Add Education
          </button>
        </div>
      </div>

      {/* ===== EXPERIENCE ===== */}
      <div className="border p-4 rounded-xl space-y-4">
        <h3 className="flex items-center gap-2 font-semibold">
          <Briefcase className="w-4 h-4" />
          Experience
        </h3>

        {/* Rendered List */}
        {experienceList.map((exp: Experience, index: number) => (
          <div key={index} className="flex items-center gap-2 border p-3 rounded-lg bg-slate-50/50">
            <div className="grid md:grid-cols-2 gap-2 flex-1">
              <input defaultValue={exp.title} className="p-2 border rounded bg-white" placeholder="Title" />
              <input defaultValue={exp.startYear} className="p-2 border rounded bg-white" placeholder="Start Year" />
              
              {/* Pre-filled Month Dropdown for existing items */}
              <select defaultValue={exp.startMonth || ''} className="p-2 border rounded bg-white">
                <option value="">Select Start Month</option>
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => removeExperience(index)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
              title="Remove Experience"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}

        {/* ADD EXPERIENCE FORM */}
        <div className="grid md:grid-cols-2 gap-2 border-t pt-4">
          <input
            placeholder="Title"
            value={newExperience.title}
            onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            placeholder="Start Year"
            value={newExperience.startYear}
            onChange={(e) => setNewExperience({ ...newExperience, startYear: e.target.value })}
            className="p-2 border rounded"
          />
          
          {/* Month Dropdown Selector */}
          <select
            value={newExperience.startMonth}
            onChange={(e) => setNewExperience({ ...newExperience, startMonth: e.target.value })}
            className="p-2 border rounded"
          >
            <option value="">Select Start Month</option>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={addExperience}
            className="col-span-2 flex items-center justify-center gap-2 bg-primary text-white p-2 rounded-lg hover:opacity-90 transition"
          >
            <Plus className="w-4 h-4" />
            Add Experience
          </button>
        </div>
      </div>
    </section>
  );
}