import { ServerAuthGuard } from "@/components/auth/ServerAuthGuard";

export default async function TutorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <ServerAuthGuard allowedRoles={["tutor"]} locale={locale}>
      {children}
    </ServerAuthGuard>
  );
}
