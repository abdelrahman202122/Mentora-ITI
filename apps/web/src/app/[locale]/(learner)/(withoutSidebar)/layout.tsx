import Footer from "@/components/ui/footer"
import { Navbar } from "@/components/ui/navbar"

export default function BlankLayout({
  children,
  params,
}: {
  children: React.ReactNode
 
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar role="learner"  />

      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  )
}