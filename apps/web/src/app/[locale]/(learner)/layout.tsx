import { ServerAuthGuard } from "@/components/auth/ServerAuthGuard"
import Sidebar from "@/components/learner/Sidebar"

export default async function LearnerLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <ServerAuthGuard allowedRoles={["learner"]} locale={locale}>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </ServerAuthGuard>
  )
}
