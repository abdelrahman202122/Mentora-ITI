import { redirect } from "next/navigation";

type TutorMatchRedirectPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function TutorMatchRedirectPage({
  params,
}: TutorMatchRedirectPageProps) {
  const { locale } = await params;

  redirect(`/${locale}/find-tutor?mode=browse`);
}
