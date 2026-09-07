// 정산 기간: 9/7(월) ~ 9/12(토). 이 기간의 기록만 목표/통계에 산정한다.
export const WINDOW_START = "2026-09-07";
export const WINDOW_END = "2026-09-12";

export const DAILY_GOAL_MINUTES = 50 * 60;
export const WEEKLY_GOAL_MINUTES = 300 * 60;
export const STAFF_HEADCOUNT = 38;
export const TREE_SITE_URL = "https://tree-kappa-black.vercel.app";

export const WINDOW_DATES = [
  { date: "2026-09-07", label: "월" },
  { date: "2026-09-08", label: "화" },
  { date: "2026-09-09", label: "수" },
  { date: "2026-09-10", label: "목" },
  { date: "2026-09-11", label: "금" },
  { date: "2026-09-12", label: "토" },
];

export function kstToday() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

export function isWithinWindow(date: string) {
  return date >= WINDOW_START && date <= WINDOW_END;
}
