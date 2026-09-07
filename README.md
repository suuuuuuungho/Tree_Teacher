# Tree_Teacher

중등부 기도나무 프로젝트 — 교사 통계 전용 페이지. **기도 기록 입력은 기존 [Tree](https://github.com/) 기도나무 사이트에서** 하고(학년·반 선택에서 "교사"/"교역자" 선택 후 입력), 이 사이트는 그 기록을 학년별(1학년/2학년/3학년/신입반)로 집계해 통계만 보여주는 읽기 전용(read-only) 대시보드입니다.

- 정산 기간: 2026-09-07(월) ~ 2026-09-12(토)
- 목표: 하루 50시간 / 한 주 300시간 (교사 전체 합산)
- 폰트: 의연체(Uiyeun)
- DB: 기존 Tree 사이트와 **동일한** Neon Postgres `prayers` 테이블을 읽기 전용으로 조회 (school_group이 `교사`/`교역자`인 기록만)
- 학년 매핑: `app/lib/roster.ts`에 교사 이름 → 학년 매핑이 하드코딩되어 있음 (`docs/roster.csv`가 원본)

## 로컬 개발

```bash
npm install
npm run dev
```

`DATABASE_URL` 환경 변수가 없으면 통계 API는 `configured: false`를 반환합니다. `.env.example`을 참고해 `.env.local`을 만들어 주세요 — 기존 Tree 프로젝트의 `DATABASE_URL`과 **동일한 값**을 사용해야 같은 기록을 읽어옵니다.

## 배포

Vercel 프로젝트에 기존 Tree 사이트와 동일한 `DATABASE_URL` 환경 변수를 설정한 뒤 배포합니다 (`vercel.json`은 Next.js 프레임워크를 사용, 새 DB를 만들지 않음).
