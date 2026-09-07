export type Grade = "1학년" | "2학년" | "3학년" | "신입반";

export const GRADES: Grade[] = ["1학년", "2학년", "3학년", "신입반"];

export const ROSTER: { name: string; grade: Grade }[] = [
  { name: "박희경", grade: "1학년" },
  { name: "문겸석", grade: "1학년" },
  { name: "장훈희", grade: "1학년" },
  { name: "김동균", grade: "1학년" },
  { name: "김희주", grade: "1학년" },
  { name: "탁한솔", grade: "1학년" },
  { name: "박초혜", grade: "1학년" },
  { name: "강세웅", grade: "2학년" },
  { name: "강진영", grade: "2학년" },
  { name: "김미주", grade: "2학년" },
  { name: "유승길", grade: "2학년" },
  { name: "김양진", grade: "2학년" },
  { name: "최남수", grade: "2학년" },
  { name: "이행선", grade: "2학년" },
  { name: "김종범", grade: "3학년" },
  { name: "김희정", grade: "3학년" },
  { name: "김진영", grade: "3학년" },
  { name: "임태영", grade: "3학년" },
  { name: "서승범", grade: "3학년" },
  { name: "오성광", grade: "3학년" },
  { name: "김예인", grade: "신입반" },
  { name: "박연", grade: "신입반" },
  { name: "권세계", grade: "신입반" },
  { name: "선일목", grade: "신입반" },
  { name: "박은지", grade: "신입반" },
  { name: "김영중", grade: "신입반" },
  { name: "이선화", grade: "신입반" },
  { name: "이강화", grade: "신입반" },
  { name: "이정희", grade: "신입반" },
  { name: "원효중", grade: "신입반" },
  { name: "최윤정", grade: "신입반" },
];

const ROSTER_MAP = new Map(ROSTER.map((teacher) => [teacher.name, teacher.grade]));

export function gradeForName(name: string): Grade | null {
  return ROSTER_MAP.get(name) ?? null;
}
