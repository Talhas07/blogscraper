import React from "react";
import { cn } from "@/lib/utils";

const levelColors = {
  1: "bg-orange-500",
  2: "bg-purple-500",
  3: "bg-red-500",
};

function CustomProgress({ value, color }: any) {
  return (
    <div className="w-full h-2 bg-white border border-gray-300 rounded">
      <div
        className={cn("h-2 rounded", color)}
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
}

export default function MaturityProgressChart(data: any) {
  console.log("Data", data);
  const chartData = data.data.map((item: any) => ({
    strategy: item.strategy,
    // level: Number(item.currentLevel), // make sure it's a number
    plevel1: Number(item.pLevel1).toPrecision(1),
    plevel2: Number(item.pLevel2).toPrecision(2),
    plevel3: Number(item.pLevel3).toPrecision(3),
    pTotal: Number(item.pTotal).toPrecision(3),
  }));
  return (
    <div className="space-y-6">
      {chartData.map((item: any, index: any) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-md">{item.strategy}</h2>
            <span className="text-sm text-gray-600">Total: {item.pTotal}%</span>
          </div>
          {[1, 2, 3].map((lvl) => (
            <div key={lvl}>
              <p className="text-xs mb-1">Level {lvl}</p>
              <CustomProgress
                value={item[`plevel${lvl}`]}
                color={levelColors[lvl as keyof typeof levelColors]}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
