"use client";

import { useEffect, useMemo, useState } from "react";
import { WINDOW_START, WINDOW_END, DAILY_GOAL_MINUTES, WEEKLY_GOAL_MINUTES } from "./lib/window";

type GradeStat = { grade: string; total: number; entries: number };
type RankingEntry = { name: string; grade: string; total: number };

type Summary = {
  configured: boolean;
  today?: string;
  todayInWindow?: boolean;
  todayTotal?: number;
  weekTotal?: number;
  byGrade?: GradeStat[];
  ranking?: RankingEntry[];
};

function formatHours(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (minutes <= 0) return "0시간";
  return rest === 0 ? `${hours}시간` : `${hours}시간 ${rest}분`;
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
  const ranking = useMemo(
    () => (summary.ranking ?? []).map((entry, index, arr) => ({ ...entry, rank: arr.findIndex((other) => other.total === entry.total) + 1 })),
    [summary.ranking],
  );

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
    <p className="processNote">* 간식은 다음주 교사회의 때 · 정산 기간 {WINDOW_START} ~ {WINDOW_END}</p>

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
          const isCompeting = row.grade !== "미배정";
          const isTop = isCompeting && topGrade && row.total === topGrade.total && row.total > 0;
          const isLast = isCompeting && lastGrade && competing.length > 1 && row.total === lastGrade.total && row.total < (topGrade?.total ?? 0);
          const fairShare = WEEKLY_GOAL_MINUTES / Math.max(1, competing.length);
          return <div className={`gradeRow${isTop ? " top" : ""}${isLast ? " last" : ""}`} key={row.grade}>
            <div className="gradeRowTop">
              <span className="gradeName">
                {row.grade}
                {isTop && <span className="gradeTag top">1등 👑</span>}
                {isLast && <span className="gradeTag last">꼴찌</span>}
              </span>
              <span className="gradeMeta">{row.entries}명</span>
              <span className="gradeHours">{formatHours(row.total)}</span>
            </div>
            {row.grade !== "미배정" && <div className="gradeTrack"><span style={{ width: `${Math.min(100, (row.total / fairShare) * 100)}%` }} /></div>}
          </div>;
        })}
      </div>}
    </section>

    <section className="panel" aria-labelledby="ranking-title">
      <div className="panelHeader">
        <h2 id="ranking-title">교사 개인 랭킹</h2>
        <span className="badgeSmall">{WINDOW_START.slice(5)}~{WINDOW_END.slice(5)}</span>
      </div>
      {ranking.length === 0 ? <p className="rankingEmpty">아직 순위에 오른 기도가 없어요.</p> : <ol className="rankingList">
        {ranking.map((entry) => <li key={entry.name} className={entry.rank <= 3 ? `rank-${entry.rank}` : undefined}>
          <span className="rankingRank">{entry.rank}</span>
          <span className="rankingName">{entry.name}<small>{entry.grade}</small></span>
          <span className="rankingCount">{formatHours(entry.total)}</span>
        </li>)}
      </ol>}
    </section>

    <p className="closing">중등부 500명 예배자를 위하여</p>
  </main>;
}
