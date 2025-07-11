"use client";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
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

const chartData = [
  { month: "January", donors: 186 },
  { month: "February", donors: 305 },
  { month: "March", donors: 237 },
  { month: "April", donors: 73 },
  { month: "May", donors: 209 },
  { month: "June", donors: 214 },
  { month: "July", donors: 372 }, // January * 2
  { month: "August", donors: 610 }, // February * 2
  { month: "September", donors: 474 }, // March * 2
  { month: "October", donors: 146 }, // April * 2
  { month: "November", donors: 418 }, // May * 2
  { month: "December", donors: 428 }, // June * 2
];

const chartConfig = {
  donors: {
    label: "Donors",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function AreaChartt() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Asessments</CardTitle>
        <CardDescription>
          Showing total Assessments for the last year
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <AreaChart
            accessibilityLayer
            // data={chartData}
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <defs>
              <linearGradient id="colorDonors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4379EE" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4379EE" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" hideLabel />}
            />
            <Area
              dataKey="donors"
              type="linear"
              fill="url(#colorDonors)"
              stroke="#4379EE"
              strokeWidth={2}
              fillOpacity={1}
              dot={true}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>{/* Footer content remains the same */}</CardFooter>
    </Card>
  );
}
