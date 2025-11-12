"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const data = [
  { name: "Observer", value: 45, color: "#8884d8" },
  { name: "Contributor", value: 38, color: "#82ca9d" },
  { name: "Expert", value: 14, color: "#ffc658" },
  { name: "Moderator", value: 3, color: "#ff7300" },
];

export function RoleDistributionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-muted-foreground text-center">
          Total: 2,420 users
        </div>
      </CardContent>
    </Card>
  );
}

