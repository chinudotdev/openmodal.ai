"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { date: "Nov 1", reports: 45, verifications: 38, comments: 12 },
  { date: "Nov 5", reports: 52, verifications: 42, comments: 15 },
  { date: "Nov 10", reports: 48, verifications: 40, comments: 14 },
  { date: "Nov 15", reports: 55, verifications: 45, comments: 18 },
  { date: "Nov 20", reports: 60, verifications: 50, comments: 20 },
  { date: "Nov 25", reports: 58, verifications: 48, comments: 19 },
  { date: "Nov 30", reports: 62, verifications: 52, comments: 22 },
];

export function ContentActivityChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="reports" fill="#8884d8" name="Reports" />
            <Bar dataKey="verifications" fill="#82ca9d" name="Verifications" />
            <Bar dataKey="comments" fill="#ffc658" name="Comments" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-muted-foreground">
          This month: 234 reports submitted • 189 verifications completed (81%
          rate) • 567 comments posted
        </div>
      </CardContent>
    </Card>
  );
}
