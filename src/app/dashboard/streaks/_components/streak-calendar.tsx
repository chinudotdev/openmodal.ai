"use client";

import { Calendar, CalendarDays } from "lucide-react";

interface StreakCalendarProps {
  year: number;
  month: number;
  activityDates: string[];
  currentStreak: number;
}

export function StreakCalendar({
  year,
  month,
  activityDates,
  currentStreak,
}: StreakCalendarProps) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const today = new Date();
  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth() + 1;

  const activityDatesSet = new Set(activityDates);

  const getDayStatus = (day: number): "active" | "missed" | "future" | "today" => {
    const date = new Date(year, month - 1, day);
    const dateStr = date.toISOString().split("T")[0];
    const isToday =
      isCurrentMonth &&
      day === today.getDate() &&
      year === today.getFullYear() &&
      month === today.getMonth() + 1;

    if (isToday) return "today";
    if (date > today) return "future";
    if (activityDatesSet.has(dateStr)) return "active";
    return "missed";
  };

  const days = [];
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {monthNames[month - 1]} {year}
        </h2>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const status = getDayStatus(day);
          const isToday = status === "today";

          return (
            <div
              key={day}
              className={`
                aspect-square flex items-center justify-center rounded-md text-sm font-medium
                ${
                  status === "active"
                    ? "bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/30"
                    : status === "missed"
                      ? "bg-muted text-muted-foreground"
                      : status === "today"
                        ? "bg-primary text-primary-foreground ring-2 ring-primary"
                        : "text-muted-foreground"
                }
              `}
            >
              {day}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 pt-4 border-t text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/30" />
          <span className="text-muted-foreground">Active day</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted" />
          <span className="text-muted-foreground">Missed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary ring-2 ring-primary" />
          <span className="text-muted-foreground">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border border-border" />
          <span className="text-muted-foreground">Future</span>
        </div>
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-sm font-medium mb-2">Tips to Maintain Your Streak:</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Log in daily (counts as activity)</li>
          <li>Submit or verify a report</li>
          <li>Comment on discussions</li>
          <li>Even small actions count!</li>
        </ul>
      </div>
    </div>
  );
}

