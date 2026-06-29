import { redirect } from "next/navigation";

type FindTutorRedirectPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function FindTutorRedirectPage({
  params,
}: FindTutorRedirectPageProps) {
  const { locale } = await params;

  redirect(`/${locale}/find-tutor`);
}
