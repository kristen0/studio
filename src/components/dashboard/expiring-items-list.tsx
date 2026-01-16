
'use client';

import { useMemo, memo } from 'react';
import type { InventoryItemWithStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Calendar } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';

function ExpiringItemsListComponent({ items }: { items: InventoryItemWithStatus[] | undefined }) {
  const expiringSoonItems = useMemo(() => {
    if (!items) return [];
    return items
      .filter(item => item.status === 'EXPIRING_SOON' && item.expiryDate)
      .sort((a, b) => a.expiryDate!.toMillis() - b.expiryDate!.toMillis())
      .slice(0, 5);
  }, [items]);

  if (!items) {
    return (
      <Card className="h-full flex flex-col min-h-[300px] lg:min-h-[400px]">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col min-h-[300px] lg:min-h-[400px]">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
          Nearing Expiry
        </CardTitle>
        <CardDescription>Top items that require your attention.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {expiringSoonItems.length > 0 ? (
          <AnimatePresence>
            <ul className="space-y-3">
              {expiringSoonItems.map((item, index) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-2 rounded-md bg-accent/50"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{item.itemName}</span>
                    <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                  </div>
                  <div className="text-xs flex items-center gap-1.5 text-yellow-400 font-medium">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {formatDistanceToNowStrict(item.expiryDate!.toDate(), { addSuffix: true })}
                    </span>
                  </div>
                </motion.li>
              ))}
            </ul>
          </AnimatePresence>
        ) : (
          <div className="flex h-full min-h-[150px] items-center justify-center text-center text-muted-foreground p-4 rounded-lg bg-accent/20">
            <div>
                <p className="font-semibold">All Good!</p>
                <p className="text-sm">No items are expiring soon.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const ExpiringItemsList = memo(ExpiringItemsListComponent);
