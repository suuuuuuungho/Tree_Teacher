import { NextResponse } from "next/server";
import { database } from "../../../lib/db";
import { GRADES, gradeForName } from "../../../lib/roster";
import { kstToday, isWithinWindow, WINDOW_START, WINDOW_END } from "../../../lib/window";

const STAFF_GROUPS = ["교사", "교역자"];
const MINUTES_PER_COUNT = 30;

export async function GET() {
  const sql = database();
  if (!sql) return NextResponse.json({ configured: false });

  const today = kstToday();
  const todayInWindow = isWithinWindow(today);

  const [todayRows, weekRows, perNameRows] = await Promise.all([
    sql`SELECT COALESCE(SUM(prayer_count), 0)::int AS total
        FROM prayers WHERE school_group = ANY(${STAFF_GROUPS}) AND prayer_date = ${today}`,
    sql`SELECT COALESCE(SUM(prayer_count), 0)::int AS total
        FROM prayers WHERE school_group = ANY(${STAFF_GROUPS}) AND prayer_date BETWEEN ${WINDOW_START} AND ${WINDOW_END}`,
    sql`SELECT name, SUM(prayer_count)::int AS total
        FROM prayers WHERE school_group = ANY(${STAFF_GROUPS}) AND prayer_date BETWEEN ${WINDOW_START} AND ${WINDOW_END}
        GROUP BY name`,
  ]);

  const gradeTotals = new Map<string, { total: number; entries: number }>();
  const ranking: { name: string; grade: string; total: number }[] = [];

  for (const row of perNameRows) {
    const name = row.name as string;
    const count = Number(row.total);
    const minutes = count * MINUTES_PER_COUNT;
    const grade = gradeForName(name) ?? "미배정";
    const current = gradeTotals.get(grade) ?? { total: 0, entries: 0 };
    gradeTotals.set(grade, { total: current.total + minutes, entries: current.entries + 1 });
    ranking.push({ name, grade, total: minutes });
  }
  ranking.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, "ko"));

  const byGrade: { grade: string; total: number; entries: number }[] = GRADES.map((grade) => {
    const row = gradeTotals.get(grade);
    return { grade, total: row?.total ?? 0, entries: row?.entries ?? 0 };
  }).sort((a, b) => b.total - a.total);

  const unassigned = gradeTotals.get("미배정");
  if (unassigned) byGrade.push({ grade: "미배정", total: unassigned.total, entries: unassigned.entries });

  return NextResponse.json({
    configured: true,
    today,
    todayInWindow,
    todayTotal: Number(todayRows[0].total) * MINUTES_PER_COUNT,
    weekTotal: Number(weekRows[0].total) * MINUTES_PER_COUNT,
    byGrade,
    ranking: ranking.slice(0, 50),
  });
}
