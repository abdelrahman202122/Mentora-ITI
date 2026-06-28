'use client'; // ← Add this at the top

import { Bell, Search } from 'lucide-react';
import { useRouter } from 'next/navigation'; // ← Import useRouter

export default function Header() {
  const router = useRouter(); // ← Initialize router

  return (
    <header className="h-16 bg-white border-b-2 border-gray-200 px-12 flex items-center justify-between">
      <div className="flex items-center text-3xl text-indigo-600 font-bold gap-4">
        Mentora
      </div>

      <button 
        onClick={() => router.push('/admin')} // ← Navigate to /admin
        className="px-5 py-1 bg-blue-600 text-white rounded-sm transition-transform active:scale-95"
      >
        my Dashboard
      </button>
    </header>
  );
}