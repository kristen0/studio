
import type { Timestamp } from 'firebase/firestore';

export type ItemStatus = 'GOOD' | 'EXPIRING_SOON' | 'EXPIRED' | 'OUT_OF_STOCK';

export interface InventoryItem {
  id: string;
  itemName: string;
  quantity: number;
  category: string;
  purchaseDate?: Timestamp;
  expiryDate?: Timestamp | null;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastUpdatedBy: string; // user's uid
  userId: string; // The UID of the user who owns this item
  imageUrl?: string;
}

export interface InventoryItemWithStatus extends InventoryItem {
  status: ItemStatus;
}

export interface NeedItem {
  id: string;
  itemName: string;
  category: string;
  createdAt: Timestamp;
  addedBy: string; // user's uid
  addedByName?: string;
}

export type AppUser = {
  id: string; // Document ID from Firestore
  uid: string; // Same as id, Firebase Auth UID
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
};

