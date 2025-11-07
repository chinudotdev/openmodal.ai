import { Rocket, Shield, FlaskConical } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ReportTypeSelector() {
  const reportTypes = [
    {
      type: "deployment",
      title: "Deployment Report",
      icon: Rocket,
      description:
        "Report AI/automation actually being used in real work environments.",
      examples: [
        "GPT-4 customer service bot",
        "Robotic warehouse system",
        "Automated code review",
      ],
      points: 100,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      type: "barrier",
      title: "Barrier Report",
      icon: Shield,
      description:
        "Report obstacles preventing AI/automation from replacing human work.",
      examples: [
        "Regulations blocking robot drivers",
        "Technical limitations",
        "Human trust issues",
      ],
      points: 75,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      type: "research",
      title: "Research Update",
      icon: FlaskConical,
      description:
        "Share new research or development that could impact job automation.",
      examples: [
        "Breakthrough research paper",
        "New AI capability demo",
        "Company R&D announcement",
      ],
      points: 50,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {reportTypes.map((reportType) => {
        const Icon = reportType.icon;
        return (
          <Card key={reportType.type} className="flex flex-col">
            <CardHeader>
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${reportType.bgColor}`}
              >
                <Icon className={`h-6 w-6 ${reportType.color}`} />
              </div>
              <CardTitle>{reportType.title}</CardTitle>
              <CardDescription className="mt-2">
                {reportType.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <div className="mb-4 flex-1">
                <p className="text-sm font-medium mb-2">Examples:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {reportType.examples.map((example) => (
                    <li key={example}>• {example}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">
                    Reputation points
                  </span>
                  <span className="text-lg font-semibold">
                    +{reportType.points}
                  </span>
                </div>
                <Button asChild className="w-full">
                  <Link href={`/reports/submit/${reportType.type}`}>
                    Submit {reportType.title}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
