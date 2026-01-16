
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Home,
  Package,
  PanelLeft,
  Beef,
  User as UserIcon,
  CheckCheck,
  Warehouse,
} from 'lucide-react';
import { signOut } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuFooter,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth, useUser } from '@/firebase';
import { useInventory } from '@/context/InventoryContext';
import { useState, useMemo, useEffect } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';

const navItems = [
  { href: '/inventory/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/inventory', icon: Package, label: 'Inventory' },
  { href: '/inventory/stock', icon: Warehouse, label: 'Needs' },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const { items: inventoryItems } = useInventory();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [notificationsAcknowledged, setNotificationsAcknowledged] = useState(false);
  const [acknowledgedCount, setAcknowledgedCount] = useState(0);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/auth/login');
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  const handleLinkClick = () => {
    setIsSheetOpen(false);
  };

  const expiringItems = useMemo(() => {
    return inventoryItems.filter(item => item.status === 'EXPIRING_SOON');
  }, [inventoryItems]);

  const hasUnreadNotifications = expiringItems.length > 0 && (!notificationsAcknowledged || expiringItems.length > acknowledgedCount);

  useEffect(() => {
    // Reset acknowledged state if the number of expiring items changes
    if (expiringItems.length !== acknowledgedCount) {
      setNotificationsAcknowledged(false);
      setAcknowledgedCount(expiringItems.length);
    }
  }, [expiringItems.length, acknowledgedCount]);


  const handleMarkAllRead = () => {
    setNotificationsAcknowledged(true);
  };
  
  const handleBellClick = () => {
    if (!hasUnreadNotifications) {
      setNotificationsAcknowledged(false); // Allow re-opening if it was dismissed
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden rounded-full">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <SheetHeader className="text-left">
             <SheetTitle>
                <Link href="/" className="flex items-center gap-2 font-headline" onClick={handleLinkClick}>
                    <Beef className="h-6 w-6 text-primary" />
                    <span className="text-lg font-bold">StockCuts</span>
                </Link>
             </SheetTitle>
          </SheetHeader>
          <nav className="grid gap-6 text-lg font-medium mt-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                  pathname === item.href && "text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
       <div className="hidden items-center gap-2 sm:flex">
         <Link href="/" className="flex items-center gap-2 font-headline">
            <Beef className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">StockCuts</h1>
         </Link>
      </div>
      <nav className="hidden flex-col gap-6 text-lg font-medium sm:flex sm:flex-row sm:items-center sm:gap-5 sm:text-sm lg:gap-6 ml-6">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "transition-colors hover:text-foreground font-medium",
              pathname === item.href ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-2 md:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative rounded-full" onClick={handleBellClick}>
              <Bell className="h-4 w-4" />
              {hasUnreadNotifications && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {hasUnreadNotifications ? (
                <>
                    {expiringItems.map(item => (
                        <DropdownMenuItem key={item.id} className="flex justify-between items-center" onSelect={() => router.push('/inventory')}>
                            <div>
                                <p className="font-semibold">{item.itemName}</p>
                                <p className="text-xs text-yellow-400">
                                    Expires {formatDistanceToNowStrict(item.expiryDate!.toDate(), {addSuffix: true})}
                                </p>
                            </div>
                            <span className="text-xs text-muted-foreground">{item.category}</span>
                        </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuFooter>
                        <DropdownMenuItem className="cursor-pointer" onSelect={handleMarkAllRead}>
                            <CheckCheck className="mr-2 h-4 w-4" />
                            <span>Mark all as read</span>
                        </DropdownMenuItem>
                    </DropdownMenuFooter>
                </>
            ) : (
                <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="overflow-hidden rounded-full">
              <Avatar>
                <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
                <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/inventory/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Edit Username</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

    