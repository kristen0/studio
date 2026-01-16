
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { ItemDialog } from '@/components/inventory/item-dialog';
import { ScanDialog } from '@/components/inventory/scan-dialog';
import type { InventoryItem, InventoryItemWithStatus, ItemStatus } from '@/lib/types';
import { Loader2, Search, Inbox, PlusCircle } from 'lucide-react';
import { type ScanItemOutput } from '@/ai/flows/scan-item-flow';
import { InventoryCardGrid } from './inventory-card-grid';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { differenceInDays } from 'date-fns';

interface InventoryViewProps {
}

export function InventoryView({}: InventoryViewProps) {
  const { items, loading: inventoryLoading } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ItemStatus | 'ALL'>('ALL');

  // Dialog states
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItemWithStatus | Partial<InventoryItem> | null>(null);
  
  const loading = inventoryLoading;

  const filteredItems = useMemo(() => {
    let visibleItems = items.filter(item => {
        if (item.status === 'OUT_OF_STOCK') return false;
        if (item.status === 'EXPIRED' && statusFilter !== 'EXPIRED') {
            const daysSinceExpiry = differenceInDays(new Date(), item.expiryDate!.toDate());
            if (daysSinceExpiry > 5) return false;
        }
        return true;
    });

    if (statusFilter !== 'ALL') {
        visibleItems = visibleItems.filter(item => item.status === statusFilter);
    }
    
    if (searchQuery) {
        visibleItems = visibleItems.filter(item => 
            item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    
    return visibleItems;
  }, [items, statusFilter, searchQuery]);


  const handleAddItem = () => {
    setEditingItem(null);
    setItemDialogOpen(true);
  };

  const handleEditItem = (item: InventoryItemWithStatus) => {
    setEditingItem(item);
    setItemDialogOpen(true);
  };
  
  const handleTriggerScan = () => {
    setItemDialogOpen(false);
    setScanDialogOpen(true);
  }

  const handleScanSuccess = (scannedData: ScanItemOutput) => {
    setScanDialogOpen(false);
    
    let expiryDate;
    if (scannedData.expiryDate) {
        const parts = scannedData.expiryDate.split('-').map(p => parseInt(p, 10));
        expiryDate = new Date(parts[0], parts[1] - 1, parts[2]);
    }

    const newItem = {
      itemName: scannedData.itemName,
      category: scannedData.category,
      expiryDate: expiryDate,
      quantity: 1,
      notes: 'Scanned with AI',
    }
    setEditingItem(newItem as Partial<InventoryItem>);
    setItemDialogOpen(true);
  }

  const TABS: { label: string, value: ItemStatus | 'ALL' }[] = [
      { label: 'All Items', value: 'ALL' },
      { label: 'Good', value: 'GOOD' },
      { label: 'Expiring Soon', value: 'EXPIRING_SOON' },
      { label: 'Expired', value: 'EXPIRED' },
    ];

  return (
    <>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="w-full flex-grow text-left">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Inventory</h1>
                <p className="text-muted-foreground text-sm md:text-base">
                  Manage your current stock.
                </p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                <div className="relative flex-1 md:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 bg-background/50"
                    />
                </div>
                <Button onClick={handleAddItem} className="gap-2 shrink-0">
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Item</span>
                </Button>
            </div>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0">
            {TABS.map(tab => (
                <Button 
                    key={tab.value} 
                    variant={statusFilter === tab.value ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                        "rounded-full h-8 px-4 text-xs transition-colors whitespace-nowrap",
                        statusFilter === tab.value ? "bg-primary text-primary-foreground" : "bg-background/50 hover:bg-accent",
                    )}
                    onClick={() => setStatusFilter(tab.value)}
                >
                    {tab.label}
                </Button>
            ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex h-[50vh] w-full items-center justify-center rounded-lg border-2 border-dashed border-border/20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex h-[50vh] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/20 text-center p-4">
            <Inbox className="h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold font-headline">No Items Found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery 
                ? `No items match your search for "${searchQuery}".` 
                : "Your inventory is empty for this filter. Add an item to get started."
              }
            </p>
          </div>
        ) : (
          <InventoryCardGrid items={filteredItems} onEditItem={handleEditItem} />
        )}
      </div>

      <ItemDialog 
        open={itemDialogOpen} 
        onOpenChange={setItemDialogOpen}
        item={editingItem}
        onTriggerScan={handleTriggerScan}
      />
      <ScanDialog
        open={scanDialogOpen}
        onOpenChange={setScanDialogOpen}
        onScanSuccess={handleScanSuccess}
      />
    </>
  );
}
