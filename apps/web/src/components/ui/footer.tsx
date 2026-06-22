"use client"

import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear() 

  return (
    <footer className="w-full bg-sidebar/40 border-t border-sidebar-border px-6 md:px-12 py-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
      
        <div className="flex items-center">
          <span className="text-sidebar-primary font-bold text-xl tracking-tight">
            Mentora
          </span>
        </div>

    
        <nav className="flex items-center flex-wrap justify-center gap-6 md:gap-8 text-sm font-medium text-muted-foreground">
          <Link href="/privacy-policy" className="hover:text-sidebar-primary transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="hover:text-sidebar-primary transition-colors">
            Terms of Service
          </Link>
          <Link href="/help-center" className="hover:text-sidebar-primary transition-colors">
            Help Center
          </Link>
        </nav>

     
        <div className="text-xs text-muted-foreground/80 font-normal">
          © {currentYear} Mentora Academic. All rights reserved.
        </div>

      </div>
    </footer>
  )
}