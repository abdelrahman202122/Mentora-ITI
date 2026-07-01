import { ServerAuthGuard } from "@/components/auth/ServerAuthGuard";
import Sidebar from "@/components/ui/Sidebar";

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
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar role="tutor" />
        <main className="flex-1 overflow-y-auto overflow-x-hidden  p-4">
          {children}
        </main>
      </div>
    </ServerAuthGuard>
  );
}
