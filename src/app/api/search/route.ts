import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { capability } from "@/db/schema/capabilities";
import { job } from "@/db/schema/jobs";
import { or, ilike } from "drizzle-orm";

export interface SearchResult {
  id: string;
  title: string;
  type: "capability" | "job" | "technology" | "organization";
  url: string;
  description?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    // Validate query
    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: "Query must be at least 2 characters long" },
        { status: 400 }
      );
    }

    const searchQuery = query.trim();
    const searchPattern = `%${searchQuery}%`;

    // Search capabilities
    const capabilityResults = await db
      .select({
        id: capability.id,
        slug: capability.slug,
        name: capability.name,
        description: capability.description,
      })
      .from(capability)
      .where(
        or(
          ilike(capability.name, searchPattern),
          ilike(capability.description, searchPattern)
        )
      )
      .limit(3);

    const capabilities: SearchResult[] = capabilityResults.map((cap) => ({
      id: cap.id,
      title: cap.name,
      type: "capability" as const,
      url: `/capabilities/${cap.slug}`,
      description: cap.description || undefined,
    }));

    // Search jobs
    const jobResults = await db
      .select({
        id: job.id,
        slug: job.slug,
        title: job.title,
        shortDescription: job.shortDescription,
      })
      .from(job)
      .where(
        or(
          ilike(job.title, searchPattern),
          ilike(job.shortDescription, searchPattern),
          ilike(job.industry, searchPattern),
          ilike(job.category, searchPattern)
        )
      )
      .limit(3);

    const jobs: SearchResult[] = jobResults.map((j) => ({
      id: j.id,
      title: j.title,
      type: "job" as const,
      url: `/jobs/${j.slug}`,
      description: j.shortDescription || undefined,
    }));

    // Technologies and organizations are not implemented yet
    const technologies: SearchResult[] = [];

    const total = capabilities.length + jobs.length + technologies.length;

    return NextResponse.json({
      capabilities,
      jobs,
      technologies,
      total,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
