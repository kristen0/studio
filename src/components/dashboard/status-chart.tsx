
'use client';

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { useMemo, memo } from 'react';
import type { InventoryItemWithStatus, ItemStatus } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

const chartConfig = {
  GOOD: {
    label: "Good",
    color: "hsl(var(--chart-2))",
  },
  EXPIRING_SOON: {
    label: "Expiring Soon",
    color: "hsl(var(--chart-3))",
  },
  EXPIRED: {
    label: "Expired",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;


function StatusChartComponent({ items: filteredItems, allItems }: { items: InventoryItemWithStatus[] | undefined, allItems: InventoryItemWithStatus[] | undefined }) {
  const items = filteredItems;
  
  const chartData = useMemo(() => {
    if (!items) return [];
    
    // If all items are being shown, count by status. Otherwise, it's a single status.
    const isFiltered = allItems && items.length !== allItems.length;
    
    let statusCounts: Record<string, number> = {};
    if (isFiltered && items.length > 0) {
      const status = items[0].status;
      if (status !== 'OUT_OF_STOCK') {
        statusCounts[status] = items.length;
      }
    } else {
      statusCounts = {
        GOOD: 0,
        EXPIRING_SOON: 0,
        EXPIRED: 0,
      };
      (allItems || []).forEach(item => {
          if(item.status && item.status !== 'OUT_OF_STOCK') {
              statusCounts[item.status]++;
          }
      });
    }

    return Object.entries(statusCounts)
      .map(([name, value]) => ({ 
          name: name.replace(/_/g, ' '), 
          value, 
          fill: chartConfig[name as ItemStatus]?.color || 'hsl(var(--muted-foreground))'
      }))
      .filter(d => d.value > 0);
  }, [items, allItems]);

  const totalItemsInView = useMemo(() => items?.length || 0, [items]);

  if (!items) {
    return (
        <Card className="h-full min-h-[300px] lg:min-h-[400px]">
            <CardHeader>
                 <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="flex items-center justify-center">
                 <Skeleton className="h-[200px] w-[200px] rounded-full" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col min-h-[300px] lg:min-h-[400px]">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Inventory Status</CardTitle>
        <CardDescription>Breakdown of items by current status.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center pb-4">
        <ChartContainer config={chartConfig} className="w-full h-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
            {chartData.length > 0 ? (
                <PieChart>
                <Tooltip
                    cursor={{ fill: 'hsl(var(--accent))' }}
                    content={<ChartTooltipContent />}
                />
                <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={chartData.length > 1 ? 5 : 0}
                    stroke="hsl(var(--background))"
                    strokeWidth={3}
                >
                    {chartData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                    ))}
                </Pie>
                <Legend
                    content={({ payload }) => {
                        return (
                        <ul className="flex justify-center flex-wrap gap-x-4 gap-y-1 mt-4 text-xs text-muted-foreground">
                            {payload?.map((entry, index) => (
                            <li key={`item-${index}`} className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                {entry.value}
                            </li>
                            ))}
                        </ul>
                        )
                    }}
                />
                <text
                    x="50%"
                    y="48%"
                    textAnchor="middle"
                    className="fill-foreground"
                    >
                    <tspan
                        x="50%"
                        className="text-2xl font-bold"
                    >
                        {totalItemsInView}
                    </tspan>
                    <tspan
                        x="50%"
                        dy="1.4em"
                        className="text-sm text-muted-foreground"
                    >
                        {totalItemsInView === 1 ? 'Item' : 'Items'}
                    </tspan>
                </text>
                </PieChart>
            ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                No items to display.
                </div>
            )}
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export const StatusChart = memo(StatusChartComponent);
