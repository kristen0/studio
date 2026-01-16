'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { NeedItem } from '@/lib/types';
import { formatDistanceToNowStrict } from 'date-fns';
import { Beef, PiggyBank, Bird, Fish, Moon, Star, LucideIcon, Trash2, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';
import { memo, ComponentType, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useNeeds } from '@/context/NeedsContext';
import { cn } from '@/lib/utils';

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

interface NeedCardProps {
    item: NeedItem;
    onEdit: (item: NeedItem) => void;
}

function NeedCardComponent({ item, onEdit }: NeedCardProps) {
    const { deleteNeed } = useNeeds();
    const [dialogOpen, setDialogOpen] = useState(false);
    const addedAt = item.createdAt ? formatDistanceToNowStrict(item.createdAt.toDate(), { addSuffix: true }) : 'just now';
    const CategoryIcon = categoryIcons[item.category] || Beef;

    return (
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                className="relative h-full w-full"
            >
                <Card className={cn(
                    "h-full w-full overflow-hidden rounded-xl transition-all duration-300 relative border border-border/20",
                    "bg-gradient-to-br from-slate-500/10 to-card"
                )}>
                    <CardHeader>
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <CardTitle className="text-lg font-bold font-headline tracking-tight">{item.itemName}</CardTitle>
                                <p className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <CategoryIcon className="w-4 h-4" /> {item.category}
                                </p>
                            </div>
                            <div className="absolute top-3 right-3 flex items-center gap-1">
                                <Button
                                    aria-label="Edit item"
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => onEdit(item)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    aria-label="Delete item"
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => setDialogOpen(true)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs pt-4 border-t border-border/20 text-muted-foreground flex justify-between items-center">
                            <span>Added {addedAt}</span>
                            {item.addedByName && (
                                <span className="italic">by {item.addedByName}</span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently remove "{item.itemName}" from your needs list.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => deleteNeed(item.id)}
                >
                    Remove
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export const NeedCard = memo(NeedCardComponent);
