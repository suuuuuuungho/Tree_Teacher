"use client";

import { useEffect, useState } from "react";
import { WINDOW_START, WINDOW_END, DAILY_GOAL_MINUTES, WEEKLY_GOAL_MINUTES } from "./lib/window";

type DayStat = { date: string; label: string; minutes: number };
type GradeStat = { grade: string; total: number; entries: number; byDate: DayStat[] };

type Summary = {
  configured: boolean;
  today?: string;
  todayInWindow?: boolean;
  todayTotal?: number;
  weekTotal?: number;
  byGrade?: GradeStat[];
};

function formatHours(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (minutes <= 0) return "0시간";
  return rest === 0 ? `${hours}시간` : `${hours}시간 ${rest}분`;
}

function formatDay(minutes: number) {
  if (minutes <= 0) return "-";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}시간` : `${hours}.${Math.round((rest / 60) * 10)}시간`;
}

function TreeMascot() {
  return (
    <svg viewBox="0 0 100 110" className="treeMascot" aria-hidden="true">
      <ellipse cx="50" cy="46" rx="46" ry="40" fill="#7ecdaa" stroke="#1c1c1c" strokeWidth="3" />
      <circle cx="24" cy="34" r="20" fill="#8fd9b8" stroke="#1c1c1c" strokeWidth="3" />
      <circle cx="76" cy="34" r="20" fill="#8fd9b8" stroke="#1c1c1c" strokeWidth="3" />
      <circle cx="38" cy="50" r="5" fill="#1c1c1c" />
      <circle cx="62" cy="50" r="5" fill="#1c1c1c" />
      <path d="M40 60 Q50 68 60 60" fill="none" stroke="#1c1c1c" strokeWidth="3" strokeLinecap="round" />
      <circle cx="27" cy="56" r="5" fill="#f6c3d0" opacity=".8" />
      <circle cx="73" cy="56" r="5" fill="#f6c3d0" opacity=".8" />
      <rect x="42" y="82" width="16" height="24" rx="4" fill="#b98a55" stroke="#1c1c1c" strokeWidth="3" />
    </svg>
  );
}

export default function Home() {
  const [summary, setSummary] = useState<Summary>({ configured: false });

  useEffect(() => {
    const load = () => {
      fetch("/api/prayers/summary")
        .then((response) => response.json())
        .then((data: Summary) => setSummary(data))
        .catch(() => undefined);
    };
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, []);

  const byGrade = summary.byGrade ?? [];
  const competing = byGrade.filter((row) => row.grade !== "미배정");
  const topGrade = competing[0];
  const lastGrade = competing.length > 0 ? competing[competing.length - 1] : undefined;
  const lastGradeNames = lastGrade && competing.length > 1 && lastGrade.total < (topGrade?.total ?? 0)
    ? competing.filter((row) => row.total === lastGrade.total).map((row) => row.grade)
    : [];
  const weekTotal = summary.weekTotal ?? 0;
  const todayTotal = summary.todayTotal ?? 0;
  const weekGoalMet = weekTotal >= WEEKLY_GOAL_MINUTES;

  return <main>
    <section className="hero">
      <div className="heroBadges">
        <span className="pill mint">중등부여 부흥하라</span>
        <span className="pill pink">올인500</span>
      </div>
      <span className="decor heart1">♥</span>
      <span className="decor star1">✦</span>
      <span className="decor star2">✦</span>
      <span className="decor star3">✦</span>

      <div className="starburst">
        <div className="starburstShape" aria-hidden="true" />
        <div className="starburstInner">
          <p className="eyebrow">교사들이 함께하는</p>
          <h1><mark>중등부 기도나무</mark></h1>
          <p className="sub">프로젝트</p>
        </div>
        <TreeMascot />
        <span className="pill sky spiritBadge">영적회복</span>
      </div>
    </section>

    <section className="goalRow" aria-label="교사 전체 목표">
      <div className="goalCard">
        <span className="goalLabel">교사 전체 하루 목표</span>
        <div className="goalBox">
          <strong>{Math.floor(todayTotal / 60)}</strong><em>시간</em>
          <small>목표 50시간{summary.today ? ` · ${summary.today}` : ""}{summary.todayInWindow === false && " (정산 기간 아님)"}</small>
          <div className="goalTrack"><span style={{ width: `${Math.min(100, (todayTotal / DAILY_GOAL_MINUTES) * 100)}%` }} /></div>
        </div>
      </div>
      <div className="goalCard">
        <span className="goalLabel sky">교사 전체 한 주 목표</span>
        <div className="goalBox">
          <strong>{Math.floor(weekTotal / 60)}</strong><em>시간</em>
          <small>목표 300시간 · {WINDOW_START.slice(5)}~{WINDOW_END.slice(5)}</small>
          <div className="goalTrack"><span style={{ width: `${Math.min(100, (weekTotal / WEEKLY_GOAL_MINUTES) * 100)}%` }} /></div>
        </div>
      </div>
    </section>

    <section className="rewardRow" aria-label="보상 안내">
      <div className="rewardCard yes">
        <p>300시간 채우면</p>
        <p>교사회의 간식</p>
        <strong>부장님이 쏜다!</strong>
        {weekGoalMet && <span className="liveTag">지금 이대로예요! 🎉</span>}
      </div>
      <div className="rewardCard no">
        <p>못 채우면</p>
        <p>교사회의 간식</p>
        <strong>꼴찌 학년이 쏜다!</strong>
        {lastGradeNames.length > 0 && !weekGoalMet && <span className="liveTag">지금 꼴찌: {lastGradeNames.join(", ")}</span>}
      </div>
    </section>

    <div className="processRow">
      <div className="processStep"><span>정산</span><strong>월~토</strong></div>
      <span className="processArrow">▶</span>
      <div className="processStep sky"><span>발표</span><strong>주일 교사회의</strong></div>
      <span className="processArrow">▶</span>
      <div className="processStep yellow"><span>간식 쓰기</span><strong>다음 주</strong></div>
    </div>

    <div className="infoBox">
      <h3>정산은 이렇게!</h3>
      <ul>
        <li>기도나무 사이트에 올라간 기록만 인정</li>
        <li>전교인기도, 요한기도, 학생기도, 가정기도, 무시기도 등 전부 인정</li>
        <li>{WINDOW_START} ~ {WINDOW_END} 기록만 정산에 산정돼요</li>
        <li>기도 기록은 기존 기도나무 사이트에서 입력해 주세요 — 이 페이지는 통계만 보여줘요</li>
      </ul>
    </div>

    <section className="panel" aria-labelledby="grade-title">
      <div className="panelHeader">
        <h2 id="grade-title">학년별 통계</h2>
        <span className="badgeSmall">{WINDOW_START.slice(5)}~{WINDOW_END.slice(5)}</span>
      </div>
      {!summary.configured ? <p className="rankingEmpty">통계를 불러오고 있어요.</p> : byGrade.length === 0 ? <p className="rankingEmpty">아직 집계된 기록이 없어요.</p> : <div className="gradeList">
        {byGrade.map((row) => {
          const fairShare = WEEKLY_GOAL_MINUTES / Math.max(1, competing.length);
          return <div className="gradeRow" key={row.grade}>
            <div className="gradeRowTop">
              <span className="gradeName">{row.grade}</span>
              <span className="gradeMeta">{row.entries}명</span>
              <span className="gradeHours">{formatHours(row.total)}</span>
            </div>
            {row.grade !== "미배정" && <div className="gradeTrack"><span style={{ width: `${Math.min(100, (row.total / fairShare) * 100)}%` }} /></div>}
            <div className="gradeDayGrid">
              {row.byDate.map((day) => <div className={`gradeDayCell${day.minutes > 0 ? " hasValue" : ""}`} key={day.date}>
                <span className="dow">{day.label}</span>
                <span className="val">{formatDay(day.minutes)}</span>
              </div>)}
            </div>
          </div>;
        })}
      </div>}
    </section>

    <p className="closing">중등부 500명 예배자를 위하여</p>
  </main>;
}
