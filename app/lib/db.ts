import { neon } from "@neondatabase/serverless";

// Tree_Teacher is read-only: it reads the same `prayers` table the main
// Tree site (student/teacher prayer log) writes to. No table is created
// or written here — entry happens on the Tree site, not here.
export function database() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}
