"use client";

import Link from "next/link";
import { Target } from "lucide-react";
import { mockInterestCards } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import * as Icons from "lucide-react";

export function QuickAccess() {
  return (
    <section className="bg-muted py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            Explore By Interest
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Find what matters most to you
          </p>
        </div>

        {/* Interest Cards Grid */}
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockInterestCards.map((card, index) => {
            const IconComponent = Icons[
              card.icon as keyof typeof Icons
            ] as React.ComponentType<{ className?: string }>;

            return (
              <Link
                key={card.id}
                href={card.ctaLink}
                className="group block transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card className="h-full text-center hover:border-primary/50 transition-colors">
                  <CardHeader>
                    {/* Icon */}
                    <div className="mb-4 flex justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                        {IconComponent && (
                          <IconComponent className="h-8 w-8 text-primary" />
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <CardTitle className="text-xl">{card.title}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    {/* Description */}
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {card.description}
                    </p>
                  </CardContent>

                  <CardFooter>
                    {/* CTA Button */}
                    <Button className="w-full" variant="default">
                      {card.ctaText}
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
