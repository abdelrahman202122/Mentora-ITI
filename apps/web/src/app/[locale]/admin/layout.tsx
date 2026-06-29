import Sidebar from '@/components/admin/Sidebar'
import Header from '@/components/admin/Header'


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className=" flex flex-col h-screen overflow-hidden"  style={{ fontFamily: 'var(--font-geist-sans)' }}>
        <Header  />

      <div className="flex-1  flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}