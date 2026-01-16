'use client';

import { useState, useMemo } from 'react';
import { useNeeds } from '@/context/NeedsContext';
import { NeedDialog } from '@/components/needs/need-dialog';
import { Loader2, Search, Inbox, PlusCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { NeedCard } from './need-card';
import { AnimatePresence, motion } from 'framer-motion';
import type { NeedItem } from '@/lib/types';

export function NeedsView() {
  const { needs, loading } = useNeeds();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NeedItem | null>(null);

  const filteredNeeds = useMemo(() => {
    if (!searchQuery) return needs;
    return needs.filter(item => 
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [needs, searchQuery]);
  
  const handleAddItem = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };
  
  const handleEditItem = (item: NeedItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="w-full flex-grow text-left">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Needs</h1>
                <p className="text-muted-foreground text-sm md:text-base">
                  A list of items you need to reorder.
                </p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                <div className="relative flex-1 md:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                    placeholder="Search needs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 bg-background/50"
                    />
                </div>
                <Button onClick={handleAddItem} className="gap-2 shrink-0">
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Need</span>
                </Button>
            </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex h-[50vh] w-full items-center justify-center rounded-lg border-2 border-dashed border-border/20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : filteredNeeds.length === 0 ? (
          <div className="flex h-[50vh] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/20 text-center p-4">
            <Inbox className="h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold font-headline">No Items Found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery 
                ? `No items match your search for "${searchQuery}".` 
                : 'Your needs list is empty. Add an item to start tracking what you need to order.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4 md:gap-6">
            <AnimatePresence>
                {filteredNeeds.map((item, index) => (
                    <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                        <NeedCard item={item} onEdit={handleEditItem} />
                    </motion.div>
                ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <NeedDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        item={editingItem}
      />
    </>
  );
}
