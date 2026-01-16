
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScanLine, BellRing, LayoutDashboard, ArrowRight, Beef } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { MotionDiv } from '@/components/motion-div';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');

  const features = [
    {
      icon: <ScanLine className="h-8 w-8" />,
      title: 'AI-Powered Scanning',
      description: "Instantly add cuts with your phone's camera. Our AI captures names, weights, and pack dates automatically.",
      colorClass: 'text-sky-400 border-sky-400/20 bg-[radial-gradient(ellipse_at_center,_rgba(56,189,248,0.1)_0%,_transparent_70%)]'
    },
    {
      icon: <BellRing className="h-8 w-8" />,
      title: 'Smart Aging & Expiry',
      description: 'Get timely notifications for items nearing their Best Before date, so you can prioritize sales and reduce waste.',
      colorClass: 'text-amber-400 border-amber-400/20 bg-[radial-gradient(ellipse_at_center,_rgba(251,191,36,0.1)_0%,_transparent_70%)]'
    },
    {
      icon: <LayoutDashboard className="h-8 w-8" />,
      title: 'Insightful Dashboard',
      description: 'Visualize your stock levels with powerful charts. See what you have, what\'s running low, and what needs attention.',
      colorClass: 'text-fuchsia-400 border-fuchsia-400/20 bg-[radial-gradient(ellipse_at_center,_rgba(217,70,239,0.1)_0%,_transparent_70%)]'
    },
  ];

  const FADE_DOWN_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: -10 },
    show: { opacity: 1, y: 0, transition: { type: "spring" } },
  };

  return (
    <div className="flex flex-col min-h-dvh">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-background/95 backdrop-blur-sm sticky top-0 z-50 border-b border-border/30">
        <Link href="/" className="flex items-center justify-center" prefetch={false}>
          <Beef className="h-6 w-6 text-primary" />
          <span className="ml-2 text-lg font-bold font-headline">StockCuts</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button asChild variant="ghost" className="rounded-full">
              <Link href="/auth/login" prefetch={false}>Login</Link>
          </Button>
          <Button asChild className="rounded-full">
              <Link href="/auth/signup" prefetch={false}>Sign Up</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full h-[70vh] md:h-[80vh] relative flex items-center justify-center">
          <div className="absolute inset-0 z-0">
              {heroImage && (
                <Image 
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  data-ai-hint={heroImage.imageHint}
                  fill
                  className="object-cover"
                  priority
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
          </div>
          <div className="container px-4 md:px-6 text-center relative z-10">
            <MotionDiv
                variants={FADE_DOWN_ANIMATION_VARIANTS}
                initial="hidden"
                animate="show"
                className="flex flex-col items-center space-y-4"
            >
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                  Prime Cuts, Perfect Control.
                </h1>
                <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl">
                  StockCuts is the intelligent way to track your meat inventory, reduce waste, and maximize profit. Get started in seconds.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="group">
                  <Link href="/auth/signup" prefetch={false}>
                    Get Started Free <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </MotionDiv>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Why You'll Love StockCuts</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Everything you need to manage your meat inventory with effortless precision.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-stretch gap-8 sm:grid-cols-1 md:grid-cols-3">
              {features.map((feature, index) => (
                <MotionDiv
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative group flex flex-col items-center text-center p-6 rounded-lg border transition-all duration-300 h-full ${feature.colorClass}`}
                >
                  <div className={`p-3 rounded-full border mb-4 ${feature.colorClass.split(' ')[1]}`}>
                      <div className={feature.colorClass.split(' ')[0]}>{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold font-headline">{feature.title}</h3>
                  <p className="text-muted-foreground mt-2">
                    {feature.description}
                  </p>
                </MotionDiv>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl/tight font-headline">
                Ready to Take Control of Your Inventory?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join other butchers and chefs reducing waste and saving money. Sign up for free and see the difference.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
                <Button asChild size="lg" className="w-full">
                    <Link href="/auth/signup" prefetch={false}>Sign Up Now</Link>
                </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 StockCuts. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
