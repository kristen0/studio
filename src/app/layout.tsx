
'use client';

import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';
import { FirebaseClientProvider, useUser } from '@/firebase';
import { InventoryProvider } from '@/context/InventoryContext';
import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700']
});

// Using a client component to handle metadata is fine for this case
// as the title and description are static.
function AppMetadata() {
  return null;
}

function AuthAwareLayout({ children }: { children: React.ReactNode }) {
    const { isUserLoading } = useUser();
    const pathname = usePathname();

    const isAuthPage = pathname.startsWith('/auth');

    // Show a global loading spinner during the initial auth check,
    // but not on the auth pages themselves to prevent layout shifts.
    if (isUserLoading && !isAuthPage) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <>
            {children}
            <Toaster />
        </>
    );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
       <head>
         <title>StockCuts</title>
         <meta name="description" content="A smart inventory management tool for butchers and restaurants to track cuts and prevent waste." />
         {heroImage && <link rel="preload" href={heroImage.imageUrl} as="image" />}
       </head>
      <body className={cn('min-h-screen w-full overflow-x-hidden font-body antialiased', inter.variable)} suppressHydrationWarning>
        <FirebaseClientProvider>
            <AuthAwareLayout>
              {children}
            </AuthAwareLayout>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
