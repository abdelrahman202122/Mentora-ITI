import React from 'react'
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <nav className="flex items-center justify-between px-2 sm:px-8 py-4 bg-white border-b border-gray-100">
  
    <div className="text-xl font-bold text-indigo-600">
      Mentora
    </div>
  
    <div className="flex items-center gap-4">
      <Button className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg bg-transparent hover:bg-indigo-50 transition">
      Become a Mentor
      </Button>
      <Button className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition">
        Log In
      </Button>
    </div>
  </nav>
  )
}