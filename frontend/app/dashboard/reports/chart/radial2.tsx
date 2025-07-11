import React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface StrategyData {
  strategy: string;
  pLevel1: number;
  pLevel2: number;
  pLevel3: number;
  pTotal: number;
}

interface MaturityProgressChartProps {
  data: StrategyData[];
}

export default function MaturityRadialChart({ data }: any) {
  const chartData = data.map((item: any) => ({
    strategy: item.strategy,
    Level1: Number(item.pLevel1),
    Level2: Number(item.pLevel2),
    Level3: Number(item.pLevel3),
  }));

  return (
    <div style={{ width: "100%", height: 500 }}>
      <ResponsiveContainer>
        <RadarChart outerRadius="80%" data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="strategy" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Radar
            name="Level 1"
            dataKey="Level1"
            stroke="#f97316" // orange
            fill="#f97316"
            fillOpacity={0.4}
          />
          <Radar
            name="Level 2"
            dataKey="Level2"
            stroke="#a855f7" // purple
            fill="#a855f7"
            fillOpacity={0.4}
          />
          <Radar
            name="Level 3"
            dataKey="Level3"
            stroke="#ef4444" // red
            fill="#ef4444"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
