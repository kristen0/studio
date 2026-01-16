
'use client';

import type { InventoryItemWithStatus } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { InventoryCard } from './inventory-card';

interface InventoryCardGridProps {
    items: InventoryItemWithStatus[];
    onEditItem: (item: InventoryItemWithStatus) => void;
}

export function InventoryCardGrid({ items, onEditItem }: InventoryCardGridProps) {
    return (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4 md:gap-6">
            <AnimatePresence>
                {items.map((item, index) => (
                    <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                        <InventoryCard 
                            item={item} 
                            onEdit={onEditItem} 
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
