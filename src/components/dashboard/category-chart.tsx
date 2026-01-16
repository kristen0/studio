
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { useMemo, memo } from 'react';
import type { InventoryItemWithStatus } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

const chartConfig = {
  total: {
    label: "Total",
  },
  // We will dynamically add categories to the config
} satisfies ChartConfig;

const categoryColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function CategoryChartComponent({ items }: { items: InventoryItemWithStatus[] | undefined }) {
  const { chartData, dynamicChartConfig } = useMemo(() => {
    if (!items) return { chartData: [], dynamicChartConfig: chartConfig };

    const categoryCounts: { [key: string]: number } = {};
    items.forEach(item => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + item.quantity;
    });

    const sortedData = Object.entries(categoryCounts)
      .map(([name, total], index) => ({ 
        name, 
        total,
        fill: categoryColors[index % categoryColors.length] 
      }))
      .sort((a, b) => b.total - a.total);

    const newConfig: ChartConfig = { ...chartConfig };
    sortedData.forEach(item => {
        newConfig[item.name] = {
            label: item.name,
            color: item.fill
        }
    });

    return { chartData: sortedData, dynamicChartConfig: newConfig };
  }, [items]);

  if (!items) {
    return (
        <Card className="h-full flex flex-col min-h-[300px] lg:min-h-[400px]">
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="flex-1">
                <Skeleton className="h-full w-full" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col min-h-[300px] lg:min-h-[400px]">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Items by Category</CardTitle>
        <CardDescription>Total quantity of items in each category.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2 flex-1 pb-4">
        <ChartContainer config={dynamicChartConfig} className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
            {chartData.length > 0 ? (
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                        tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                        cursor={{ fill: 'hsl(var(--accent))' }}
                        content={<ChartTooltipContent />}
                    />
                    <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                No data to display for this filter.
                </div>
            )}
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export const CategoryChart = memo(CategoryChartComponent);
