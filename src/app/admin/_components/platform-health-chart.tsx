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

// Mock data - will be replaced with real data
const data = [
  { date: "Nov 1", users: 2200, reports: 45, verifications: 38 },
  { date: "Nov 5", users: 2250, reports: 52, verifications: 42 },
  { date: "Nov 10", users: 2300, reports: 48, verifications: 40 },
  { date: "Nov 15", users: 2347, reports: 55, verifications: 45 },
  { date: "Nov 20", reports: 60, verifications: 50 },
  { date: "Nov 25", reports: 58, verifications: 48 },
  { date: "Nov 30", reports: 62, verifications: 52 },
];

export function PlatformHealthChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Health (Last 30 Days)</CardTitle>
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
              dataKey="users"
              stroke="#8884d8"
              name="Daily Active Users"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="reports"
              stroke="#82ca9d"
              name="Reports Submitted"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="verifications"
              stroke="#ffc658"
              name="Verifications Completed"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
