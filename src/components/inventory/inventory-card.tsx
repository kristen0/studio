
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { InventoryItemWithStatus, ItemStatus } from '@/lib/types';
import { formatDistanceToNowStrict } from 'date-fns';
import { InventoryActions } from './inventory-actions';
import { cn } from '@/lib/utils';
import { Beef, Calendar, Scale, PiggyBank, Bird, Fish, Moon, Star, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { memo, ComponentType } from 'react';

const statusStyles: Record<ItemStatus, { dot: string; text: string; gradientFrom: string }> = {
  GOOD: { 
    dot: 'bg-green-500', 
    text: 'text-green-400', 
    gradientFrom: 'from-green-500/20' 
  },
  EXPIRING_SOON: { 
    dot: 'bg-yellow-500', 
    text: 'text-yellow-400', 
    gradientFrom: 'from-yellow-500/20' 
  },
  EXPIRED: { 
    dot: 'bg-red-500', 
    text: 'text-red-400',
    gradientFrom: 'from-red-500/20'
  },
  OUT_OF_STOCK: { 
    dot: 'bg-slate-500', 
    text: 'text-slate-400',
    gradientFrom: 'from-slate-500/10'
  },
};

const LambIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M16 5c2.2 0 4 1.8 4 4 0 .9-.3 1.7-.8 2.4"/>
        <path d="M18.8 17.3c-.5.4-1.2.7-2 .7H8c-2.2 0-4-1.8-4-4 0-1.2.6-2.4 1.5-3.1"/>
        <path d="M12 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2Z"/>
        <path d="M7.5 14c-.3 0-.5.2-.5.5v0c0 .3.2.5.5.5h9c.3 0 .5-.2.5-.5v0c0-.3-.2-.5-.5-.5"/>
        <path d="M7 17v-2.5"/>
        <path d="M17 17v-2.5"/>
    </svg>
);

const categoryIcons: { [key: string]: LucideIcon | ComponentType<any> } = {
    'Beef': Beef,
    'Pork': PiggyBank,
    'Poultry': Bird,
    'Lamb': LambIcon,
    'Seafood': Fish,
    'Turkey': Bird,
    'Halal': Moon,
    'Kosher': Star
};

interface InventoryCardProps {
    item: InventoryItemWithStatus;
    onEdit: (item: InventoryItemWithStatus) => void;
}

function InventoryCardComponent({ item, onEdit }: InventoryCardProps) {
    const daysToExpire = item.expiryDate ? formatDistanceToNowStrict(item.expiryDate.toDate(), { addSuffix: true }) : 'N/A';
    const lastUpdated = item.updatedAt ? formatDistanceToNowStrict(item.updatedAt.toDate(), { addSuffix: true }) : 'never';
    const CategoryIcon = categoryIcons[item.category] || Beef;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="relative h-full w-full"
        >
            <Card className={cn(
                "h-full w-full overflow-hidden rounded-xl transition-all duration-300 relative border border-border/20",
                "bg-gradient-to-br to-card",
                statusStyles[item.status].gradientFrom
            )}>
                <CardHeader className="relative z-10">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <CardTitle className="text-lg font-bold font-headline tracking-tight">{item.itemName}</CardTitle>
                            <p className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                               <CategoryIcon className="w-4 h-4" /> {item.category}
                            </p>
                        </div>
                        <div className="absolute top-3 right-3">
                            <InventoryActions item={item} onEdit={onEdit} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-4 pt-2 z-10 relative">
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground"><Scale size={14} /> Quantity</span>
                        <span className="font-medium text-lg">{item.quantity}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground"><Calendar size={14} /> Expires</span>
                        <span className={cn(
                            "font-medium",
                            (item.status === 'EXPIRED' || item.status === 'EXPIRING_SOON') && statusStyles[item.status].text
                        )}>
                            {daysToExpire}
                        </span>
                    </div>
                    
                    <div className="flex flex-col gap-2 text-xs pt-4 border-t border-border/20 text-muted-foreground">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className={cn("h-2 w-2 rounded-full", statusStyles[item.status].dot)}></span>
                                <span className={cn("font-medium", statusStyles[item.status].text)}>
                                    {item.status.replace(/_/g, ' ')}
                                </span>
                            </div>
                            <span className="truncate">
                                Updated {lastUpdated}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
export const InventoryCard = memo(InventoryCardComponent);
