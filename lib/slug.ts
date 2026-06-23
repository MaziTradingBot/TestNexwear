/** Convert a string to a URL-safe slug. */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Append a short random suffix to keep slugs/SKUs unique. */
export function randomSuffix(len = 5): string {
  return Math.random().toString(36).slice(2, 2 + len);
}
