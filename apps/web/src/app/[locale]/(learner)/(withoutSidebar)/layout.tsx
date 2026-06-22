import Footer from "@/components/ui/footer"
import { Navbar } from "@/components/ui/navbar"

export default async function BlankLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar locale={locale} />

      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  )
}