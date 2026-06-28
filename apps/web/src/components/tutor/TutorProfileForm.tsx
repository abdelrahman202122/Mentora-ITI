"use client";
import {
  useForm,
  useFieldArray,
  Controller,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  tutorProfileSchema,
  type TutorProfilePayload,
} from "@/schemas/tutor/tutor-profile-schema";
import {
  Camera,
  GraduationCap,
  Briefcase,
  Languages,
  Plus,
  Trash2,
  Loader2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUpdateTutorProfile } from "@/hooks/tutor/updateTutorProfile";
import { useUploadAvatar } from "@/hooks/tutor/useUploadeAvatar";
import { Experience, TutorProfileData } from "@/types/tutor/tutor-profile";
import { UserData } from "@/services/tutor/patchProfile";
import { createTutorProfile } from "@/services/tutor/postProfile";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

// type Props = {
//   mode: "create" | "update";
//   data?: TutorProfileData;
//   tutorId?: string;
// };
type Props = {
  mode: "create" | "update";
  data?: Partial<TutorProfileData> & { userData?: Partial<UserData> };
  tutorId?: string;
};
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-red-600">{message}</p>;
}

export default function TutorProfileForm({ mode, data, tutorId }: Props) {
  const isUpdate = mode === "update";
  const router = useRouter();

  // ── switched to useUpdateTutorProfile so UI only refreshes after server confirms ──
  const updateProfile = useUpdateTutorProfile(tutorId);
  const uploadAvatar = useUploadAvatar(tutorId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [newLanguage, setNewLanguage] = useState("");

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TutorProfilePayload>({
    resolver: zodResolver(tutorProfileSchema) ,
    defaultValues: {
      name: data?.userData?.name ?? "",
      headline: data?.headline ?? "",
      bio: data?.bio ?? "",
      hourlyRate: data?.hourlyRate ?? undefined,
      languages: data?.languages?.map((l) => ({ value: l })) ?? [],
      education: data?.education ?? [],
      experience: data?.experience ?? [],
    },
  });

  // ───── Field Arrays ─────
  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({ control, name: "education" });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({ control, name: "experience" });

  const {
    fields: languageFields,
    append: appendLanguage,
    remove: removeLanguage,
  } = useFieldArray({ control, name: "languages" });

  // ───── Avatar ─────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ───── Language ─────
  const handleAddLanguage = () => {
    const trimmed = newLanguage.trim();
    if (!trimmed) return;
    appendLanguage({ value: trimmed });
    setNewLanguage("");
  };

  // ───── Submit ─────
  // UI only updates AFTER mutateAsync resolves (server confirmed) — no optimistic updates
  // const onSubmit = async (values: TutorProfilePayload) => {
  //   try {
  //     if (pendingAvatarFile) {
  //       await uploadAvatar.mutateAsync(pendingAvatarFile);
  //     }

  //     const payload = {
  //       headline: values.headline,
  //       bio: values.bio,
  //       hourlyRate: values.hourlyRate,
  //       languages: values.languages.map((l) => l.value),
  //       education: values.education,
  //       experience: values.experience.map((exp: Experience) => ({
  //         ...exp,
  //         endYear: exp.endYear ?? null,
  //         endMonth: exp.endMonth ?? null,
  //       })),
  //       userData: { name: values.name },
  //     };

  //     // awaiting here means the query invalidation (and UI refresh)
  //     // only happens after the server responds successfully
  //     await updateProfile.mutateAsync(payload);

  //     if (!isUpdate) {
  //       router.push("/dashboard");
  //     }
  //   } catch {
  //     // error handled by mutation / your toast setup
  //   }
  // };
const onSubmit = async (values: TutorProfilePayload) => {
  try {
    if (pendingAvatarFile) {
      await uploadAvatar.mutateAsync(pendingAvatarFile);
    }

    const payload = {
      headline: values.headline,
      bio: values.bio,
      hourlyRate: values.hourlyRate,
      languages: values.languages.map((l) => l.value),
      education: values.education,
      experience: values.experience.map((exp: Experience) => ({
        ...exp,
        endYear: exp.endYear ?? null,
        endMonth: exp.endMonth ?? null,
      })),
      userData: { name: values.name },
    };

    if (isUpdate) {
      await updateProfile.mutateAsync(payload);
    } else {
      await createTutorProfile(payload);
      router.push("tutor/dashboard");
    }
  } catch {
    // error handled by your toast setup
  }
};
  const currentAvatar =
    avatarPreview ??
    (data?.userData?.avatar
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${data.userData.avatar}`
      : "/../../../public/profile-default.jpeg");

  return (
    <section className="space-y-8 bg-card border border-border rounded-2xl p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* ───── HEADER ───── */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="relative group w-32 h-32 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Image
                src={currentAvatar}
                alt="Avatar"
                fill
                className="rounded-full object-cover border-4 border-border"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-full flex flex-col items-center justify-center text-white transition gap-1">
                <Camera className="w-5 h-5" />
                <span className="text-xs">Change photo</span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            {avatarPreview && (
              <span className="text-xs text-primary font-medium">
                New photo selected
              </span>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1 space-y-4">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Full Name
              </label>
              <input
                {...register("name")}
                readOnly={!isUpdate}
                className={`w-full p-3 border rounded-lg transition ${
                  !isUpdate
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                }`}
                placeholder="Full Name"
              />
              <FieldError message={errors.name?.message} />
            </div>

            {/* Headline */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Headline
              </label>
              <input
                {...register("headline")}
                className="w-full p-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                placeholder="e.g. Math Tutor with 5 years experience"
              />
              <FieldError message={errors.headline?.message} />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Bio
              </label>
              <textarea
                {...register("bio")}
                className="w-full p-3 border rounded-lg min-h-[120px] bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition resize-none"
                placeholder="Tell students about yourself..."
              />
              <FieldError message={errors.bio?.message} />
            </div>

            {/* Hourly Rate */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Hourly Rate (USD)
              </label>
              <div className="relative w-40">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  $
                </span>
                <input
                  type="number"
                  {...register("hourlyRate", { valueAsNumber: true })}
                  className="w-full pl-7 pr-3 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                  placeholder="25"
                />
              </div>
              <FieldError message={errors.hourlyRate?.message} />
            </div>

          </div>
        </div>

        {/* ───── LANGUAGES ───── */}
        <div className="border p-4 rounded-xl space-y-3">
          <h3 className="flex items-center gap-2 font-semibold">
            <Languages className="w-4 h-4 text-primary" />
            Languages
          </h3>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 min-h-[32px]">
            {languageFields.length === 0 && (
              <p className="text-sm text-muted-foreground">No languages added yet.</p>
            )}
            {languageFields.map((field, index) => (
              <span
                key={field.id}
                className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 text-sm px-3 py-1 rounded-full"
              >
                <input type="hidden" {...register(`languages.${index}.value`)} />
                {field.value}
                <button
                  type="button"
                  onClick={() => removeLanguage(index)}
                  className="hover:text-red-500 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add input */}
          <div className="flex gap-2">
            <input
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddLanguage();
                }
              }}
              placeholder="e.g. English"
              className="flex-1 p-2 border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
            />
            <button
              type="button"
              onClick={handleAddLanguage}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-primary border border-primary/40 rounded-lg hover:bg-primary/5 transition"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
          <FieldError message={errors.languages?.message} />
        </div>

        {/* ───── EDUCATION ───── */}
        <div className="border p-4 rounded-xl space-y-4">
          <h3 className="flex items-center gap-2 font-semibold">
            <GraduationCap className="w-4 h-4 text-primary" />
            Education
          </h3>

          {/* <FieldError message={errors.education?.root?.message} /> */}
<FieldError message={errors.education?.message as string} />

          {educationFields.length === 0 && (
            <p className="text-sm text-muted-foreground">No education entries yet.</p>
          )}

          {educationFields.map((field, index) => (
            <div
              key={field.id}
              className="grid md:grid-cols-2 gap-3 border p-4 rounded-xl bg-muted/30 relative pr-12"
            >
              <p className="md:col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Entry {index + 1}
              </p>

              <div>
                <input
                  {...register(`education.${index}.degree`)}
                  placeholder="Degree *"
                  className="w-full p-2.5 border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none transition"
                />
                <FieldError message={errors.education?.[index]?.degree?.message} />
              </div>

              <div>
                <input
                  {...register(`education.${index}.field`)}
                  placeholder="Field of Study *"
                  className="w-full p-2.5 border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none transition"
                />
                <FieldError message={errors.education?.[index]?.field?.message} />
              </div>

              <div>
                <input
                  {...register(`education.${index}.institution`)}
                  placeholder="Institution *"
                  className="w-full p-2.5 border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none transition"
                />
                <FieldError message={errors.education?.[index]?.institution?.message} />
              </div>

              <div>
                <input
                  type="number"
                  {...register(`education.${index}.graduationYear`, {
                    valueAsNumber: true,
                  })}
                  placeholder="Graduation Year *"
                  className="w-full p-2.5 border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none transition"
                />
                <FieldError message={errors.education?.[index]?.graduationYear?.message} />
              </div>

              <button
                type="button"
                onClick={() => removeEducation(index)}
                className="absolute top-3 right-3 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              appendEducation({
                degree: "",
                field: "",
                institution: "",
                graduationYear: 0,
              })
            }
            className="flex items-center gap-2 text-sm text-primary border border-primary/40 px-4 py-2 rounded-lg hover:bg-primary/5 transition"
          >
            <Plus className="w-4 h-4" />
            Add Education
          </button>
        </div>

        {/* ───── EXPERIENCE ───── */}
        <div className="border p-4 rounded-xl space-y-4">
          <h3 className="flex items-center gap-2 font-semibold">
            <Briefcase className="w-4 h-4 text-primary" />
            Experience
          </h3>

          {/* <FieldError message={errors.experience?.root?.message} /> */}
<FieldError message={errors.experience?.message as string} />

          {experienceFields.length === 0 && (
            <p className="text-sm text-muted-foreground">No experience entries yet.</p>
          )}

          {experienceFields.map((field, index) => (
            <div
              key={field.id}
              className="grid md:grid-cols-2 gap-3 border p-4 rounded-xl bg-muted/30 relative pr-12"
            >
              <p className="md:col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Entry {index + 1}
              </p>

              <div className="md:col-span-2">
                <input
                  {...register(`experience.${index}.title`)}
                  placeholder="Job Title *"
                  className="w-full p-2.5 border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none transition"
                />
                <FieldError message={errors.experience?.[index]?.title?.message} />
              </div>

              <div>
                <input
                  type="number"
                  {...register(`experience.${index}.startYear`, {
                    valueAsNumber: true,
                  })}
                  placeholder="Start Year *"
                  className="w-full p-2.5 border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none transition"
                />
                <FieldError message={errors.experience?.[index]?.startYear?.message} />
              </div>

              <div>
                <Controller
                  control={control}
                  name={`experience.${index}.startMonth`}
                  render={({ field: f }) => (
                    <select
                      {...f}
                      value={f.value ?? ""}
                      onChange={(e) => f.onChange(Number(e.target.value))}
                      className="w-full p-2.5 border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none transition"
                    >
                      <option value="">Start Month *</option>
                      {MONTHS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  )}
                />
                <FieldError message={errors.experience?.[index]?.startMonth?.message} />
              </div>

              <div>
                <input
                  type="number"
                  {...register(`experience.${index}.endYear`, {
                    setValueAs: (v) => (v === "" || isNaN(Number(v)) ? null : Number(v)),
                  })}
                  placeholder="End Year (leave empty if current)"
                  className="w-full p-2.5 border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none transition"
                />
              </div>

              <div>
                <Controller
                  control={control}
                  name={`experience.${index}.endMonth`}
                  render={({ field: f }) => (
                    <select
                      {...f}
                      value={f.value ?? ""}
                      onChange={(e) =>
                        f.onChange(e.target.value ? Number(e.target.value) : null)
                      }
                      className="w-full p-2.5 border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none transition"
                    >
                      <option value="">End Month (optional)</option>
                      {MONTHS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>

              <label className="md:col-span-2 flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register(`experience.${index}.isCurrent`)}
                  className="w-4 h-4 accent-primary"
                />
                I currently work here
              </label>

              <button
                type="button"
                onClick={() => removeExperience(index)}
                className="absolute top-3 right-3 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              appendExperience({
                title: "",
                startYear: 0,
                startMonth: 0,
                endYear: null,
                endMonth: null,
                isCurrent: false,
              })
            }
            className="flex items-center gap-2 text-sm text-primary border border-primary/40 px-4 py-2 rounded-lg hover:bg-primary/5 transition"
          >
            <Plus className="w-4 h-4" />
            Add Experience
          </button>
        </div>

{/* ───── SUBMIT ───── */}
<div className="flex justify-end">
  <button
    type="button"
    onClick={() => {
      console.log("errors", errors);
      console.log("values", control._formValues);
      handleSubmit(onSubmit)();
    }}
    disabled={isSubmitting}
    className="btn-primary flex items-center gap-2 min-w-[130px] justify-center"
  >
    {isSubmitting ? (
      <>
        <Loader2 className="w-4 h-4 animate-spin" />
        Saving...
      </>
    ) : isUpdate ? (
      "Save Changes"
    ) : (
      "Create Profile"
    )}
  </button>
</div>
      </form>
    </section>
  );
}