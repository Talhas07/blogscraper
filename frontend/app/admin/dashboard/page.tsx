// app/graphs/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  BarChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
export default function GraphsPage() {
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    // Fetch monthly blog data
    fetch(`${API_URL}/blogs/monthly-count`)
      .then((res) => res.json())
      .then((data) => {
        // Transform data for Recharts
        const transformed = data.labels.map((label: string, index: number) => ({
          month: label,
          count: data.data[index],
        }));
        setMonthlyData(transformed);
      })
      .catch((error) => console.error("Error fetching monthly data:", error));

    // Fetch category/subcategory data
    fetch(`${API_URL}/blogs/categories-stats`)
      .then((res) => res.json())
      .then((data) => {
        // Transform data for Recharts
        const transformed = data.labels.map((label: string, index: number) => ({
          category: label,
          subcategories: data.datasets[0].data[index],
          blogs: data.datasets[1].data[index],
        }));
        setCategoryData(transformed);
      })
      .catch((error) => console.error("Error fetching category data:", error));
  }, []);

  const lineChartConfig = {
    count: {
      label: "Blogs Created",
      color: "hsl(296, 100.00%, 30.00%)",
    },
  };

  const barChartConfig = {
    subcategories: {
      label: "Subcategories",
      color: "hsl(285, 80.90%, 36.90%)",
    },
    blogs: {
      label: "Blogs",
      color: "hsl(340, 82%, 52%)",
    },
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 bg-[url('/image.png')] bg-contain">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Blog Analytics Dashboard
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-700">
              Monthly Blog Creation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={lineChartConfig}>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={monthlyData}>
                  <XAxis
                    dataKey="month"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    dataKey="count"
                    stroke={lineChartConfig.count.color}
                    fill={lineChartConfig.count.color}
                    type="monotone"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-700">
              Category Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barChartConfig}>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={categoryData}>
                  <XAxis
                    dataKey="category"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="subcategories"
                    fill={barChartConfig.subcategories.color}
                    stackId="a"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="blogs"
                    fill={barChartConfig.blogs.color}
                    stackId="a"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
