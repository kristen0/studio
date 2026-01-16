
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  type CollectionReference,
} from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { InventoryItem, InventoryItemWithStatus } from '@/lib/types';
import { getItemStatus } from '@/lib/inventory-utils';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { differenceInDays } from 'date-fns';

type InventoryContextType = {
  items: InventoryItemWithStatus[];
  loading: boolean;
  addItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'lastUpdatedBy' | 'userId'>) => Promise<void>;
  updateItem: (id: string, item: Partial<Omit<InventoryItem, 'id' | 'userId'>>) => Promise<void>;
  deleteItem: (id: string) => void;
};

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItemWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const inventoryCollectionPath = 'inventory_items';
    const inventoryCollection = collection(db, inventoryCollectionPath) as CollectionReference<InventoryItem>;
    
    const q = query(inventoryCollection, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const itemsData = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id,
              status: getItemStatus(data),
            };
          });

        setItems(itemsData);
        setLoading(false);
      },
      (error) => {
        const permissionError = new FirestorePermissionError({
          path: inventoryCollectionPath,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, db]);

  const addItem = useCallback(async (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'lastUpdatedBy'| 'userId'>) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to add an item.' });
        return;
    }
    
    const inventoryCollection = collection(db, 'inventory_items');
    const newItem = {
      ...item,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastUpdatedBy: user.uid,
    };

    addDoc(inventoryCollection, newItem).catch(error => {
        console.error('Error adding item:', error);
        const permissionError = new FirestorePermissionError({
          path: inventoryCollection.path,
          operation: 'create',
          requestResourceData: newItem,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw error;
    }).then(() => {
        toast({ title: 'Success', description: 'Item added successfully.' });
    });
  }, [user, db, toast]);

  const updateItem = useCallback(async (id: string, item: Partial<Omit<InventoryItem, 'id' | 'userId'>>) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to update an item.' });
        return;
    }
    
    const itemRef = doc(db, 'inventory_items', id);
    const updatedData = {
      ...item,
      updatedAt: serverTimestamp(),
      lastUpdatedBy: user.uid,
    };

    updateDoc(itemRef, updatedData).catch(error => {
      console.error('Error updating item:', error);
      const permissionError = new FirestorePermissionError({
        path: itemRef.path,
        operation: 'update',
        requestResourceData: updatedData,
      });
      errorEmitter.emit('permission-error', permissionError);
      throw error;
    }).then(() => {
      toast({ title: 'Success', description: 'Item updated successfully.' });
    });
  }, [user, db, toast]);

  const deleteItem = useCallback((id: string) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to delete an item.' });
      return;
    }
    const itemRef = doc(db, 'inventory_items', id);
  
    deleteDoc(itemRef)
      .then(() => {
        toast({ title: 'Success', description: 'Item deleted successfully.' });
      })
      .catch((error) => {
        console.error('Error deleting item:', error);
        const permissionError = new FirestorePermissionError({
          path: itemRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }, [user, db, toast]);

  const value = useMemo(() => ({
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
  }), [items, loading, addItem, updateItem, deleteItem]);

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
