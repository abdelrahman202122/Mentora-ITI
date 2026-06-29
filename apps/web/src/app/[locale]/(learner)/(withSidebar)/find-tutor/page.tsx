import { getTranslations } from "next-intl/server";

import Stepper from "@/components/findTutor/Stepper";

type FindTutorPageProps = {
  searchParams?: Promise<{
    mode?: string;
  }>;
};

export default async function FindTutorPage({
  searchParams,
}: FindTutorPageProps) {
  const resolvedSearchParams = await searchParams;
  const initialStep = resolvedSearchParams?.mode === "browse" ? 4 : 1;
  const t = await getTranslations("findTutor.page");

  return (
    <div className="px-4 py-6 md:px-4">
      <div className="mx-auto max-w-8xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
          {t("description")}
        </p>
      </div>
      <Stepper initialStep={initialStep} />
    </div>
  );
}
