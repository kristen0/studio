
'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { NeedsProvider } from '@/context/NeedsContext';
import { InventoryProvider } from '@/context/InventoryContext';

export default function InventoryLayout({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If auth state is resolved and there's no user, redirect to login.
    if (!isUserLoading && !user) {
      router.replace('/auth/login');
    }
  }, [user, isUserLoading, router]);

  // Don't render anything if the user is not yet known or is being redirected.
  // The root layout will show a loading spinner.
  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // If user is authenticated, render the layout.
  return (
    <InventoryProvider>
      <NeedsProvider>
        <div className="flex min-h-screen w-full flex-col bg-background">
          <Header />
          <main className={cn(
            "flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 lg:p-8",
            "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/30 to-background"
          )}>
            {children}
          </main>
        </div>
      </NeedsProvider>
    </InventoryProvider>
  );
}
