
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import type { ItemStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { memo } from 'react';

interface Summary {
    totalItems: number;
    good: number;
    expiringSoon: number;
    expired: number;
}

interface SummaryCardsProps {
  summary: Summary;
  activeFilter: ItemStatus | 'ALL';
  onFilterChange: (filter: ItemStatus | 'ALL') => void;
}

function SummaryCardsComponent({ summary, activeFilter, onFilterChange }: SummaryCardsProps) {
  const cardData = [
    { title: 'Total Items', value: summary.totalItems, icon: Package, color: 'text-primary', gradient: 'from-primary/10', filter: 'ALL' as const },
    { title: 'Good', value: summary.good, icon: CheckCircle, color: 'text-green-400', gradient: 'from-green-500/10', filter: 'GOOD' as const },
    { title: 'Expiring Soon', value: summary.expiringSoon, icon: AlertTriangle, color: 'text-yellow-400', gradient: 'from-yellow-500/10', filter: 'EXPIRING_SOON' as const },
    { title: 'Expired', value: summary.expired, icon: XCircle, color: 'text-red-400', gradient: 'from-red-500/10', filter: 'EXPIRED' as const },
  ];

  return (
    <>
      {cardData.map((card) => (
        <motion.div
            key={card.title}
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ type: 'spring', stiffness: 300, mass: 0.5 }}
            className="col-span-1"
        >
            <Card 
              className={cn(
                'cursor-pointer transition-all duration-300 bg-card/50 backdrop-blur-sm border-border/20 h-full',
                'bg-gradient-to-br to-card',
                card.gradient,
                activeFilter === card.filter ? 'ring-2 ring-primary/80 shadow-lg scale-105' : 'hover:shadow-md'
              )}
              onClick={() => onFilterChange(card.filter)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className={cn('h-4 w-4', card.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.title === 'Total Items' ? 'in stock' : card.value === 1 ? 'item' : 'items'}
                </p>
              </CardContent>
            </Card>
        </motion.div>
      ))}
    </>
  );
}

export const SummaryCards = memo(SummaryCardsComponent);
