import { differenceInDays, startOfDay } from 'date-fns';
import type { InventoryItem, ItemStatus } from './types';

export function getItemStatus(
  item: Pick<InventoryItem, 'quantity' | 'expiryDate'>
): ItemStatus {
  if (item.quantity === 0) {
    return 'OUT_OF_STOCK';
  }

  if (!item.expiryDate) {
    return 'GOOD';
  }

  const now = new Date();
  const expiry = item.expiryDate.toDate();

  if (expiry < now) {
    return 'EXPIRED';
  }
  
  const daysUntilExpiry = differenceInDays(startOfDay(expiry), startOfDay(now));

  if (daysUntilExpiry <= 2) {
    return 'EXPIRING_SOON';
  }

  return 'GOOD';
}
