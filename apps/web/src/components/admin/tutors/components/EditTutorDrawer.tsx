
"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
// import { useDrawerEffects } from "@/hooks/use-drawer-effects";
// import { DrawerOverlay } from "@/components/shared/drawer-overlay";
// import { Avatar } from "@/components/shared/avatar";
import type { Tutor } from "@/types/admin";
import { useDrawerEffects } from "@/hooks/admin/use-drawer-effects";
import { Avatar, DrawerOverlay } from "../../shared";

export interface EditTutorFormState {
  name: string;
  bio: string;
  subjects: string[];
  hourlyRate: string;
  commissionRate: string;
  moderatorNotes: string;
}

interface EditTutorDrawerProps {
  tutor: Tutor | null;
  onClose: () => void;
  onSave: (tutor: Tutor, form: EditTutorFormState) => void;
}

export function EditTutorDrawer({ tutor, onClose, onSave }: EditTutorDrawerProps) {
  const [form, setForm] = useState<EditTutorFormState>({
    name: "", bio: "", subjects: [], hourlyRate: "", commissionRate: "", moderatorNotes: "",
  });

  useEffect(() => {
    if (!tutor) return;
    setForm({
      name: tutor.name,
      bio: tutor.bio ?? "",
      subjects: [...tutor.subjects],
      hourlyRate: tutor.hourlyRate.toFixed(2),
      commissionRate: (tutor.commissionRate ?? "15%").replace("%", "").trim(),
      moderatorNotes: tutor.moderatorNotes ?? "",
    });
  }, [tutor]);

  useDrawerEffects(!!tutor, onClose);

  if (!tutor) return null;

  const update = <K extends keyof EditTutorFormState>(key: K, value: EditTutorFormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleSubject = (s: string) =>
    update("subjects", form.subjects.includes(s) ? form.subjects.filter((x) => x !== s) : [...form.subjects, s]);

  const addCustomSubject = () => {
    const s = window.prompt("Add a new subject:");
    if (s && s.trim() && !form.subjects.includes(s.trim())) {
      update("subjects", [...form.subjects, s.trim()]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <DrawerOverlay onClick={onClose} />
      <aside role="dialog" aria-modal="true" aria-label={`Edit tutor: ${tutor.name}`}
        className="relative flex h-full w-full max-w-[450px] flex-col rounded-l-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Edit Tutor Profile</h2>
          <button type="button" onClick={onClose} aria-label="Close edit panel"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Avatar name={tutor.name} seed={tutor.id} avatarUrl={tutor.avatarUrl} size="lg" />
            <button type="button" className="inline-flex h-9 items-center rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              Change Photo
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Full Name</label>
            <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)}
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
          </div>

          <div className="grid grid-cols-1 gap-3 rounded-md border border-gray-200 bg-gray-50 p-4 text-sm">
            {tutor.location && (<div><p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Location</p><p className="mt-0.5 text-gray-800">{tutor.location}</p></div>)}
            {tutor.degree && (<div><p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Degree</p><p className="mt-0.5 text-gray-800">{tutor.degree}</p></div>)}
            {tutor.joinedDate && (<div><p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Join Date</p><p className="mt-0.5 text-gray-800">{tutor.joinedDate}</p></div>)}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-900">Biography</label>
            <textarea value={form.bio} onChange={(e) => update("bio", e.target.value)} rows={5}
              className="w-full resize-y rounded-md border border-gray-300 bg-white p-3 text-sm text-gray-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
          </div>

          {tutor.experience && tutor.experience.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-900">Experience</label>
              <div className="space-y-3">
                {tutor.experience.map((exp, idx) => (
                  <div key={idx} className="rounded-md border border-gray-200 bg-white p-3">
                    <p className="text-sm font-medium text-gray-900">{exp.title}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{exp.org}{exp.period ? ` | ${exp.period}` : ""}</p>
                    {exp.description && <p className="mt-1 text-xs text-gray-600">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-900">Expertise &amp; Subjects</label>
            <div className="flex flex-wrap gap-1.5">
              {form.subjects.map((s) => (
                <button key={s} type="button" onClick={() => toggleSubject(s)}
                  className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-200">
                  {s}<X className="h-3 w-3" />
                </button>
              ))}
              <button type="button" onClick={addCustomSubject}
                className="inline-flex items-center rounded-full border border-dashed border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-500 transition-colors hover:border-indigo-400 hover:text-indigo-600">
                + Add subject
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Hourly Rate</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">$</span>
                <input type="number" step="0.01" min="0" value={form.hourlyRate} onChange={(e) => update("hourlyRate", e.target.value)}
                  className="h-10 w-full rounded-md border border-gray-300 bg-white pl-7 pr-9 text-sm text-gray-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">/ hr</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Commission Rate</label>
              <div className="relative">
                <input type="number" step="0.1" min="0" max="100" value={form.commissionRate} onChange={(e) => update("commissionRate", e.target.value)}
                  className="h-10 w-full rounded-md border border-gray-300 bg-white pl-3 pr-7 text-sm text-gray-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">%</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-900">Moderator Notes</label>
            <textarea value={form.moderatorNotes} onChange={(e) => update("moderatorNotes", e.target.value)}
              placeholder="Add internal notes about this tutor's application..." rows={4}
              className="w-full resize-y rounded-md border border-gray-300 bg-white p-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button type="button" onClick={onClose}
            className="inline-flex h-10 items-center rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">Cancel</button>
          <button type="button" onClick={() => onSave(tutor, form)}
            className="inline-flex h-10 items-center rounded-md bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700">Save Changes</button>
        </div>
      </aside>
    </div>
  );
}
