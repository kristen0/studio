'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNeeds } from '@/context/NeedsContext';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Beef, PiggyBank, Bird, Fish, Moon, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NeedItem } from '@/lib/types';
import { useEffect, useState, ComponentType } from 'react';

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
    { value: 'Other', label: 'Other', icon: Star },
];

const formSchema = z.object({
  itemName: z.string().min(1, 'Item name is required.'),
  category: z.string().min(1, 'Category is required.'),
});
  
type NeedFormValues = z.infer<typeof formSchema>;

interface NeedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: NeedItem | null;
}

export function NeedDialog({ open, onOpenChange, item }: NeedDialogProps) {
  const isMobile = useIsMobile();
  const { addNeed, updateNeed } = useNeeds();
  const [loading, setLoading] = useState(false);

  const isEditMode = !!item;
  
  const form = useForm<NeedFormValues>({
    resolver: zodResolver(formSchema),
  });
  
  useEffect(() => {
    if (open) {
      form.reset({
        itemName: item?.itemName || '',
        category: item?.category || '',
      });
    }
  }, [open, item, form]);

  async function onSubmit(values: NeedFormValues) {
    setLoading(true);

    const promise = isEditMode
      ? updateNeed(item.id, values)
      : addNeed(values);

    promise
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
            {isEditMode ? 'Edit Need Item' : 'Add to Needs List'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details of the item you need.' : 'Add a new item you need to order.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {content}
            <DialogFooterComponent className="pt-4 gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
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
