
'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Loader2, Beef } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Redirect if user is already logged in
    if (!isUserLoading && user) {
      router.replace('/inventory/dashboard');
    }
  }, [user, isUserLoading, router]);

  // Show a loading spinner only if we're in the process of redirecting
  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Otherwise, render the children for login/signup
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
            <Link href="/" className="flex items-center gap-2 mb-4">
                <Beef className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold tracking-tight font-headline">StockCuts</span>
            </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
