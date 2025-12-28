"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { date: "Nov 1", total: 2200, new: 15 },
  { date: "Nov 5", total: 2250, new: 12 },
  { date: "Nov 10", total: 2300, new: 10 },
  { date: "Nov 15", total: 2347, new: 9 },
  { date: "Nov 20", total: 2380, new: 8 },
  { date: "Nov 25", total: 2400, new: 7 },
  { date: "Nov 30", total: 2420, new: 6 },
];

export function UserGrowthChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Growth</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#8884d8"
              name="Total Users"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="new"
              stroke="#82ca9d"
              name="New Signups"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-muted-foreground">
          Current: 2,420 total | +220 this month | Growth rate: +10%
          month-over-month
        </div>
      </CardContent>
    </Card>
  );
}
