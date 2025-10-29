"use server";

import { revalidateTag } from "next/cache";

/**
 * Cache invalidation utilities for author data
 * Use these functions to invalidate cached author data when it changes
 */

/**
 * Invalidate all author-related caches
 * Call this when any author data changes (name, description, etc.)
 */
export async function invalidateAuthorCaches() {
  revalidateTag("authors", "max");
}

/**
 * Invalidate specific author cache
 * Call this when a specific author's data changes
 * @param authorId - The ID of the author whose cache should be invalidated
 */
export async function invalidateAuthorCache(authorId: string) {
  revalidateTag(`author-${authorId}`, "max");
  // Note: Cache Components will automatically invalidate based on the authorId parameter
  // since it's part of the cache key
}

/**
 * Invalidate all authors list cache
 * Call this when the list of authors changes (new author added, author removed)
 */
export async function invalidateAllAuthorsCache() {
  revalidateTag("all-authors", "max");
}

/**
 * Invalidate all author-related caches
 * Use this for major changes that affect all author data
 */
export async function invalidateAllAuthorData() {
  revalidateTag("authors", "max");
  revalidateTag("author", "max");
  revalidateTag("all-authors", "max");
}
