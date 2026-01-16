
'use client';

import { useInventory } from '@/context/InventoryContext';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { CategoryChart } from '@/components/dashboard/category-chart';
import { StatusChart } from '@/components/dashboard/status-chart';
import { ExpiringItemsList } from '@/components/dashboard/expiring-items-list';
import { Loader2 } from 'lucide-react';
import { useMemo, useState, memo, useCallback } from 'react';
import type { ItemStatus } from '@/lib/types';
import { motion } from 'framer-motion';

function DashboardPageComponent() {
  const { items, loading } = useInventory();
  const [activeFilter, setActiveFilter] = useState<ItemStatus | 'ALL'>('ALL');
  
  const onFilterChange = useCallback((filter: ItemStatus | 'ALL') => {
    setActiveFilter(filter);
  }, []);

  const inStockItems = useMemo(() => {
    if (loading || !items) return [];
    return items.filter(item => item.status !== 'OUT_OF_STOCK');
  }, [items, loading]);

  const summary = useMemo(() => {
    if (loading || !items) {
      return { totalItems: 0, good: 0, expiringSoon: 0, expired: 0 };
    }
    const totalItems = inStockItems.reduce((sum, item) => sum + item.quantity, 0);
    const good = items.filter(item => item.status === 'GOOD').length;
    const expiringSoon = items.filter(item => item.status === 'EXPIRING_SOON').length;
    const expired = items.filter(item => item.status === 'EXPIRED').length;
    return { totalItems, good, expiringSoon, expired };
  }, [items, inStockItems, loading]);
  
  const filteredItems = useMemo(() => {
    if (loading || !items) return [];
    if (activeFilter === 'ALL') return inStockItems;
    return items.filter(item => item.status === activeFilter);
  }, [items, activeFilter, loading, inStockItems]);

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div 
      className="grid auto-rows-max items-start gap-4 md:gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <SummaryCards 
            summary={summary} 
            activeFilter={activeFilter} 
            onFilterChange={onFilterChange} 
          />
        </div>
      </motion.div>
      <motion.div 
        className="grid gap-4 md:gap-8 grid-cols-1 lg:grid-cols-3 items-stretch"
        variants={containerVariants}
      >
        <motion.div className="lg:col-span-2" variants={itemVariants}>
          <CategoryChart items={filteredItems} />
        </motion.div>
        <motion.div className="lg:col-span-1" variants={itemVariants}>
          <StatusChart items={filteredItems} allItems={inStockItems} />
        </motion.div>
        <motion.div className="lg:col-span-3" variants={itemVariants}>
          <ExpiringItemsList items={items} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default memo(DashboardPageComponent);
