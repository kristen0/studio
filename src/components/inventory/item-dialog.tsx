
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Timestamp } from 'firebase/firestore';
import { useInventory } from '@/context/InventoryContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScanLine, Loader2, Beef, PiggyBank, Bird, Fish, Moon, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InventoryItem, InventoryItemWithStatus } from '@/lib/types';
import { useEffect, useState, ComponentType } from 'react';
import { format } from 'date-fns';

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


const categories = [
    { value: 'Beef', label: 'Beef', icon: Beef },
    { value: 'Pork', label: 'Pork', icon: PiggyBank },
    { value: 'Poultry', label: 'Poultry', icon: Bird },
    { value: 'Lamb', label: 'Lamb', icon: LambIcon as ComponentType<any> },
    { value: 'Seafood', label: 'Seafood', icon: Fish },
    { value: 'Turkey', label: 'Turkey', icon: Bird },
    { value: 'Halal', label: 'Halal', icon: Moon },
    { value: 'Kosher', label: 'Kosher', icon: Star },
];

const formSchema = z.object({
  itemName: z.string().min(1, 'Item name is required.'),
  category: z.string().min(1, 'Category is required.'),
  quantity: z.coerce.number().min(0, 'Quantity must be 0 or more.'),
  expiryDate: z.date().optional(),
  notes: z.string().optional(),
});
  
type ItemFormValues = z.infer<typeof formSchema>;

interface ItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItemWithStatus | Partial<InventoryItem> | null;
  onTriggerScan?: () => void;
}

export function ItemDialog({ open, onOpenChange, item, onTriggerScan }: ItemDialogProps) {
  const isMobile = useIsMobile();
  const { addItem, updateItem } = useInventory();
  const [loading, setLoading] = useState(false);

  const isEditMode = !!(item && 'id' in item && item.id);
  
  const toDate = (val: any): Date | undefined => {
    if (val instanceof Timestamp) return val.toDate();
    if (val instanceof Date) return val;
    return undefined;
  };
  
  const form = useForm<ItemFormValues>({
    resolver: zodResolver(formSchema),
  });
  
  useEffect(() => {
    if (open) {
      form.reset({
        itemName: item?.itemName || '',
        category: item?.category || '',
        quantity: item?.quantity ?? 1,
        notes: item?.notes || '',
        expiryDate: toDate(item?.expiryDate),
      });
    }
  }, [item, open, form]);

  async function onSubmit(values: ItemFormValues) {
    setLoading(true);
    const toTimestamp = (date?: Date) => date ? Timestamp.fromDate(date) : null;
    
    const finalValues = { ...values };
    
    const itemData = {
      ...finalValues,
      expiryDate: toTimestamp(finalValues.expiryDate),
    };

    const submissionPromise = isEditMode && item?.id
      ? updateItem(item.id, itemData)
      : addItem(itemData as Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'lastUpdatedBy' | 'userId'>);

    submissionPromise
        .then(() => {
            onOpenChange(false);
        })
        .catch((error) => {
            console.error("Submission failed, caught in dialog:", error);
        })
        .finally(() => {
            setLoading(false);
        });
  }
  
  const DialogComponent = isMobile ? Sheet : Dialog;
  const DialogContentComponent = isMobile ? SheetContent : DialogContent;
  const DialogFooterComponent = isMobile ? SheetFooter : DialogFooter;

  const content = (
      <div className="grid gap-4 py-4">
        {!isEditMode && onTriggerScan && (
            <Button type="button" variant="outline" size="sm" onClick={onTriggerScan} className="w-full gap-1.5">
                <ScanLine className="h-4 w-4" />
                Scan with AI to pre-fill
            </Button>
        )}
        <FormField
          control={form.control}
          name="itemName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Ribeye Steak" {...field} disabled={loading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1" {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                <FormItem className="flex flex-col pt-2">
                    <FormLabel>Best Before</FormLabel>
                    <FormControl>
                        <Input 
                            type="date"
                            value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                            onChange={(e) => {
                                if(e.target.value) {
                                    const date = new Date(e.target.value);
                                    const timeZoneOffset = date.getTimezoneOffset() * 60000;
                                    field.onChange(new Date(date.getTime() + timeZoneOffset));
                                } else {
                                    field.onChange(undefined);
                                }
                            }}
                            className={cn(!field.value && "text-muted-foreground/50")}
                            disabled={loading}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        
        <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
            <FormItem>
            <FormLabel>Category</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                <FormControl>
                <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                </FormControl>
                <SelectContent>
                {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                        <cat.icon className="w-4 h-4 text-muted-foreground" />
                        <span>{cat.label}</span>
                    </div>
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            <FormMessage />
            </FormItem>
        )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="e.g., Dry-aged, USDA Prime, from local farm..." {...field} disabled={loading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
  );

  return (
    <DialogComponent open={open} onOpenChange={onOpenChange}>
      <DialogContentComponent className={cn(
        isMobile ? 'overflow-y-auto' : 'sm:max-w-md',
        "bg-card"
      )}>
        <DialogHeader>
          <DialogTitle className="font-headline">
            {isEditMode ? 'Edit Item' : 'Add New Item'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update the details of your inventory item." 
              : "Fill out the form to add a new cut to your inventory."
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {content}
            <DialogFooterComponent className="pt-4 gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading || (isEditMode && !form.formState.isDirty)}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditMode ? 'Save Changes' : 'Add Item'}
                </Button>
            </DialogFooterComponent>
          </form>
        </Form>
      </DialogContentComponent>
    </DialogComponent>
  );
}
