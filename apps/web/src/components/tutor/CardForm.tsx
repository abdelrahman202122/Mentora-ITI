
'use client';

import { X, Loader2 } from "lucide-react";
import { useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSubjectCategories } from "@/hooks/metadata/useSubjectCategories";
import { useEducationLevels } from "@/hooks/metadata/useEducationLevels";
import { useCurricula } from "@/hooks/metadata/useCurricula";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@/types/metaData/category";
import { EducationLevel } from "@/types/metaData/educationLevel";
import { Curriculum } from "@/types/metaData/curriculum";
import { courseSchema, type CoursePayload } from "@/schemas/subject/subject-schema";
import { createTutorSubject } from "@/services/tutor/addSubject";
import { useCreateTutorSubject } from "@/hooks/tutor/useCreateTutorSubject";
import { useCurrentUser } from "@/hooks/auth/use-auth";
export default function CourseForm({ onClose }: { onClose: () => void }) {
  const locale = useLocale() as "ar" | "en";
  const { data: categoriesData } = useSubjectCategories();
  const { data: educationLevelsData } = useEducationLevels();
  const { data: curriculaData } = useCurricula();
  const user = useCurrentUser();
  const createSubject = useCreateTutorSubject(user.data?.id || "");

  const form = useForm<CoursePayload>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      educationLevel: "",
      curriculum: "",
      gradeNote: "",
    },
  });

async function handleSubmit(values: CoursePayload) {
  createSubject.mutate(values, {
    onSuccess: () => onClose(),
    onError: (error) => console.error(error),
  })
}
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-2xl w-full max-w-xl p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Add New Course</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

          {/* Title */}
          <FieldError message={form.formState.errors.title?.message}>
            <input
              placeholder="Course Title"
              className="w-full p-3 rounded-lg border border-border bg-background"
              {...form.register("title")}
            />
          </FieldError>

          {/* Description */}
          <FieldError message={form.formState.errors.description?.message}>
            <textarea
              placeholder="Description"
              className="w-full p-3 rounded-lg border border-border bg-background"
              {...form.register("description")}
            />
          </FieldError>

          {/* Category */}
          <FieldError message={form.formState.errors.category?.message}>
            <Select
              value={form.watch("category")}
              onValueChange={(val) => form.setValue("category", val, { shouldValidate: true })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categoriesData?.map((cat: Category) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat[locale]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldError>

          {/* Education Level */}
          <FieldError message={form.formState.errors.educationLevel?.message}>
            <Select
              value={form.watch("educationLevel")}
              onValueChange={(val) => form.setValue("educationLevel", val, { shouldValidate: true })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Education Level" />
              </SelectTrigger>
              <SelectContent>
                {educationLevelsData?.map((level: EducationLevel) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level[locale]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldError>

          {/* Curriculum */}
          <FieldError message={form.formState.errors.curriculum?.message}>
            <Select
              value={form.watch("curriculum")}
              onValueChange={(val) => form.setValue("curriculum", val, { shouldValidate: true })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Curriculum" />
              </SelectTrigger>
              <SelectContent>
                {curriculaData?.map((cur: Curriculum) => (
                  <SelectItem key={cur.value} value={cur.value}>
                    {cur[locale]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldError>

          {/* Grade Note (optional) */}
          <FieldError message={form.formState.errors.gradeNote?.message}>
            <input
              placeholder="Grade / Year (optional, e.g. Preparatory 1)"
              className="w-full p-3 rounded-lg border border-border bg-background"
              {...form.register("gradeNote")}
            />
          </FieldError>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="px-4 py-2 rounded-lg bg-primary text-white flex items-center gap-2"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FieldError({
  children,
  message,
}: {
  children: React.ReactNode;
  message?: string;
}) {
  return (
    <div>
      {children}
      {message && (
        <p className="mt-2 text-xs font-medium text-red-600">{message}</p>
      )}
    </div>
  );
}