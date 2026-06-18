'use client';

import { CheckCircle2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function HomePage() {
  const searchParams = useSearchParams();
  const showLoginSuccess = searchParams.get('login') === 'success';

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-8 text-slate-950">
      <div className="mx-auto w-full max-w-5xl">
        {showLoginSuccess && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            <CheckCircle2 className="size-5 text-emerald-600" />
            Login successfully
          </div>
        )}

        <h2 className="text-2xl font-semibold">Home page</h2>
      </div>
    </main>
  );
}
