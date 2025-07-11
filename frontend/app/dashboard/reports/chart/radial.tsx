"use client";

import { TrendingUp } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function Radial(data: any) {
  console.log("radial data", data);
  const chartData = data.data.map((item: any) => ({
    strategy: item.strategy,
    level: Number(item.currentLevel), // make sure it's a number
    plevel1: Number(item.pLevel1),
    plevel2: Number(item.pLevel2),
    plevel3: Number(item.pLevel3),
    pTotal: Number(item.pTotal),
  }));
  console.log("radial chartData", chartData);
  return (
    // <Card>
    <div className="w-full rounded-md border bg-white shadow-sm dark:bg-slate-800">
      <CardHeader className="items-center">
        <CardTitle>Maturity Levels</CardTitle>
        {/* <CardDescription>
          Showing total visitors for the last 6 months
        </CardDescription> */}
      </CardHeader>
      <CardContent className="pb-0 w-full ">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[380px] w-full "
        >
          <RadarChart data={chartData} className="pb-0 w-full ">
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="strategy" />
            <PolarGrid />
            <Radar
              dataKey="level"
              stroke="rgb(134, 38, 0)" // outline color (optional)
              fill="rgb(203, 66, 2)" // fill color inside
              fillOpacity={0.2}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Current Maturity levels for each Strategy{" "}
          {/* <TrendingUp className="h-4 w-4" /> */}
        </div>
        {/* <div className="flex items-center gap-2 leading-none text-muted-foreground">
          January - June 2024
        </div> */}
      </CardFooter>
    </div>
    // </Card>
  );
}
