import Sidebar from "@/components/learner/Sidebar"

export default function LearnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}