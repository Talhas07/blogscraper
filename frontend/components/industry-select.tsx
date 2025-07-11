"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Industry {
  id: number;
  name: string;
}

interface IndustrySelectProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function IndustrySelect({ value, onChange }: IndustrySelectProps) {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/industries`);
        if (!response.ok) {
          throw new Error('Failed to fetch industries');
        }
        const data = await response.json();
        setIndustries(data);
      } catch (error) {
        console.error('Error fetching industries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIndustries();
  }, []);

  return (
    <div className="space-y-2">
      <Label htmlFor="industry">Industry</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="industry">
          <SelectValue placeholder="Select an industry" />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <SelectItem value="loading" disabled>
              Loading...
            </SelectItem>
          ) : (
            industries.map((industry) => (
              <SelectItem key={industry.id} value={industry.name}>
                {industry.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
} 