import { NextResponse } from "next/server";
import { database } from "../../../lib/db";
import { GRADES, gradeForName } from "../../../lib/roster";
import { kstToday, isWithinWindow, WINDOW_START, WINDOW_END, WINDOW_DATES } from "../../../lib/window";

const STAFF_GROUPS = ["교사", "교역자"];
const MINUTES_PER_COUNT = 30;

type GradeAgg = { total: number; names: Set<string>; byDate: Record<string, number> };

export async function GET() {
  const sql = database();
  if (!sql) return NextResponse.json({ configured: false });

  const today = kstToday();
  const todayInWindow = isWithinWindow(today);

  const [todayRows, weekRows, perNameDateRows] = await Promise.all([
    sql`SELECT COALESCE(SUM(prayer_count), 0)::int AS total
        FROM prayers WHERE school_group = ANY(${STAFF_GROUPS}) AND prayer_date = ${today}`,
    sql`SELECT COALESCE(SUM(prayer_count), 0)::int AS total
        FROM prayers WHERE school_group = ANY(${STAFF_GROUPS}) AND prayer_date BETWEEN ${WINDOW_START} AND ${WINDOW_END}`,
    sql`SELECT name, prayer_date::text AS date, SUM(prayer_count)::int AS total
        FROM prayers WHERE school_group = ANY(${STAFF_GROUPS}) AND prayer_date BETWEEN ${WINDOW_START} AND ${WINDOW_END}
        GROUP BY name, prayer_date`,
  ]);

  const gradeMap = new Map<string, GradeAgg>();
  const ensure = (grade: string) => {
    let agg = gradeMap.get(grade);
    if (!agg) { agg = { total: 0, names: new Set(), byDate: {} }; gradeMap.set(grade, agg); }
    return agg;
  };

  for (const row of perNameDateRows) {
    const name = row.name as string;
    const date = row.date as string;
    const minutes = Number(row.total) * MINUTES_PER_COUNT;
    const grade = gradeForName(name) ?? "미배정";
    const agg = ensure(grade);
    agg.total += minutes;
    agg.names.add(name);
    agg.byDate[date] = (agg.byDate[date] ?? 0) + minutes;
  }

  const byGrade = [...GRADES, "미배정"]
    .map((grade) => {
      const agg = gradeMap.get(grade);
      return {
        grade,
        total: agg?.total ?? 0,
        entries: agg?.names.size ?? 0,
        byDate: WINDOW_DATES.map(({ date, label }) => ({ date, label, minutes: agg?.byDate[date] ?? 0 })),
      };
    })
    .filter((row) => row.grade !== "미배정" || row.total > 0)
    .sort((a, b) => b.total - a.total);

  return NextResponse.json({
    configured: true,
    today,
    todayInWindow,
    todayTotal: Number(todayRows[0].total) * MINUTES_PER_COUNT,
    weekTotal: Number(weekRows[0].total) * MINUTES_PER_COUNT,
    byGrade,
  });
}
