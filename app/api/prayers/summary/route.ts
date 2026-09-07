import { NextResponse } from "next/server";
import { database } from "../../../lib/db";
import { GRADES, gradeForName } from "../../../lib/roster";
import { kstToday, isWithinWindow, WINDOW_START, WINDOW_END, WINDOW_DATES } from "../../../lib/window";

const STAFF_GROUPS = ["교사", "교역자"];
const MINUTES_PER_COUNT = 30;
const GRADE_ORDER = [...GRADES, "미배정"];

type GradeAgg = { total: number; names: Set<string>; byDate: Record<string, number> };
type NameAgg = { grade: string; total: number; byDate: Record<string, number> };

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
  const ensureGrade = (grade: string) => {
    let agg = gradeMap.get(grade);
    if (!agg) { agg = { total: 0, names: new Set(), byDate: {} }; gradeMap.set(grade, agg); }
    return agg;
  };

  const nameMap = new Map<string, NameAgg>();
  const dailyTotalMap: Record<string, number> = {};

  for (const row of perNameDateRows) {
    const name = row.name as string;
    const date = row.date as string;
    const minutes = Number(row.total) * MINUTES_PER_COUNT;
    const grade = gradeForName(name) ?? "미배정";

    const gradeAgg = ensureGrade(grade);
    gradeAgg.total += minutes;
    gradeAgg.names.add(name);
    gradeAgg.byDate[date] = (gradeAgg.byDate[date] ?? 0) + minutes;

    let nameAgg = nameMap.get(name);
    if (!nameAgg) { nameAgg = { grade, total: 0, byDate: {} }; nameMap.set(name, nameAgg); }
    nameAgg.total += minutes;
    nameAgg.byDate[date] = (nameAgg.byDate[date] ?? 0) + minutes;

    dailyTotalMap[date] = (dailyTotalMap[date] ?? 0) + minutes;
  }

  const dailyTotals = WINDOW_DATES.map(({ date, label }) => ({ date, label, minutes: dailyTotalMap[date] ?? 0 }));

  const byGrade = GRADE_ORDER
    .map((grade) => {
      const agg = gradeMap.get(grade);
      return {
        grade,
        total: agg?.total ?? 0,
        entries: agg?.names.size ?? 0,
        byDate: WINDOW_DATES.map(({ date, label }) => ({ date, label, minutes: agg?.byDate[date] ?? 0 })),
      };
    })
    .filter((row) => row.grade !== "미배정" || row.total > 0);

  const teachers = [...nameMap.entries()]
    .map(([name, agg]) => ({
      name,
      grade: agg.grade,
      total: agg.total,
      byDate: WINDOW_DATES.map(({ date, label }) => ({ date, label, minutes: agg.byDate[date] ?? 0 })),
    }))
    .sort((a, b) => GRADE_ORDER.indexOf(a.grade) - GRADE_ORDER.indexOf(b.grade) || b.total - a.total || a.name.localeCompare(b.name, "ko"));

  return NextResponse.json({
    configured: true,
    today,
    todayInWindow,
    todayTotal: Number(todayRows[0].total) * MINUTES_PER_COUNT,
    weekTotal: Number(weekRows[0].total) * MINUTES_PER_COUNT,
    byGrade,
    teachers,
    dailyTotals,
  });
}
