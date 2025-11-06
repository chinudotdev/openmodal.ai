/**
 * Simple date formatting utilities
 * Alternative to date-fns for basic formatting
 */

export function formatDistanceToNow(
  date: Date | string,
  options?: { addSuffix?: boolean },
): string {
  const now = new Date();
  const past = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (seconds < 60) {
    return options?.addSuffix ? "just now" : "now";
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return options?.addSuffix
      ? `${minutes} minute${minutes !== 1 ? "s" : ""} ago`
      : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return options?.addSuffix
      ? `${hours} hour${hours !== 1 ? "s" : ""} ago`
      : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return options?.addSuffix
      ? `${days} day${days !== 1 ? "s" : ""} ago`
      : `${days}d`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return options?.addSuffix
      ? `${months} month${months !== 1 ? "s" : ""} ago`
      : `${months}mo`;
  }

  const years = Math.floor(months / 12);
  return options?.addSuffix
    ? `${years} year${years !== 1 ? "s" : ""} ago`
    : `${years}y`;
}
