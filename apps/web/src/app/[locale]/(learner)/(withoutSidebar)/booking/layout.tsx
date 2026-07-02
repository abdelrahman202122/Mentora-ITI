import { ServerAuthGuard } from "@/components/auth/ServerAuthGuard";

export default async function BookingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <ServerAuthGuard locale={locale}>
      {children}
    </ServerAuthGuard>
  );
}
