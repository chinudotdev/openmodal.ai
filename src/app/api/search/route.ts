import  { NextRequest, NextResponse } from "next/server";
import { generateMockSearchResults } from "@/lib/mock-data";

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

    // Generate mock results
    const results = generateMockSearchResults(query.trim());

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
