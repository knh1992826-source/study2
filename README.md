<div align="center">

# 🧭 제주 코스 메이커

**날씨에 맞춰 제주 5개 권역의 여행코스를 골라 주는 3D 지도 + AI 코스 메이커**

제주대 청년도약 부트캠프 1기 BOOT UP · 2일 개별 과제 (제주 IP × 공공데이터 × AI 에이전트)

`React 19` · `Vite` · `React Router` · `Zustand` · `Bootstrap(Darkly)` · `Three.js` · `Supabase` · `Claude Sonnet 5.5` · `Vercel`

</div>

---

**🔗 배포**: https://jeju-myth-map.vercel.app  ·  **💻 소스**: https://github.com/knh1992826-source/study2

---

## ✨ 기획 의도

제주 여행은 "어디를 어떤 순서로, 날씨가 나쁘면 어디로?"가 가장 어렵습니다. 이 앱은 제주를 **5개 권역**(제주시·성산·서귀포·애월/한림·한라산)으로 나눠 3D 지도 위에 보여 주고, 한국관광공사 여행코스·기상청 날씨·국가유산청 정보를 엮어 **오늘 날씨에 맞는 코스**를 추천합니다. AI 코스 메이커는 도구를 직접 호출해 오전→점심→오후→저녁 일정까지 짜 줍니다.

## 🧭 주요 기능

| 화면 | 경로 | 설명 |
|---|---|---|
| 홈 | `/` | 기획 의도, 5개 권역 코스 카드, **동작 체크**(React·Supabase·서버 함수·API 키 유무) |
| **3D 코스 지도** | `/world` | Three.js 한라산·오름·바다 위 5개 권역 구슬 + 금색 **일주 코스 경로선**. 구슬을 클릭하면 그 권역의 여행코스·국가유산이 열리고, **기상청 날씨가 3D 하늘에 반영**(흐림→구름, 풍속→바람 입자)되며 추천 방향(실내/야외)을 표시 |
| 코스 탐색 | `/explore` | 여행코스·관광지·문화시설·축제·음식점을 지역 키워드로 검색, 제주시 6시간 예보, 관련 국가유산 |
| **AI 코스 메이커** | `/agent` | Claude가 스스로 API 도구를 골라 호출하고 코스를 구성. **호출한 도구 목록**을 화면에 표시 |
| 즐겨찾기 | `/favorites` | Supabase에 저장, 새로고침해도 유지 |
| 404 | (없는 주소) | 안내 페이지 |

## 🏗 아키텍처

```
[브라우저: React 앱]
  router.jsx ─ RootLayout(메뉴·알림) ─ pages/*
  store/useAppStore.js   ← 닉네임·알림·즐겨찾기·대화 (Zustand)
     │ fetch('/api/...')              │ supabase.from(...)
     ▼                                ▼
[Vercel 서버 함수 /api/*]          [Supabase DB]
  API 키는 서버에만 존재            favorites · chats
   ├─ /api/tour     → 한국관광공사 TourAPI (여행코스 25, 관광지 12 …)   (공공 API ①)
   ├─ /api/weather  → 기상청 단기예보 (제주시 53,38 / 서귀포시 52,33)   (공공 API ②)
   ├─ /api/heritage → 국가유산청 국가유산 검색                         (공공 API ③)
   ├─ /api/hello    → 동작 체크 (키 값은 노출하지 않고 유무만)
   └─ /api/agent    → Claude Sonnet 5.5 + 위 3개 API를 "도구"로 사용
```

- **키 보호**: 공공데이터·Claude 키는 `VITE_` 접두사 없이 서버 함수에서만 읽습니다.
- **재사용**: 같은 함수(`server/tools.js`)를 화면용 API와 에이전트 도구가 함께 씁니다.
- **에이전트 안전장치**: 도구 호출 루프 최대 5회 · `max_tokens` 1024 · 대화 기록 최근 10개만 전송 · 모델 `claude-sonnet-5-5` 고정.

## 🤖 에이전트 테스트 질문

키를 넣고 아래 질문으로 확인합니다 (결과 캡처는 발표자료에 첨부).

1. "제주시 지금 날씨 어때?" → `get_weather` 1회
2. "관덕정이 어떤 국가유산이야?" → `search_heritage`
3. "내일 서귀포에 비 오면 실내 위주 코스 짜줘" → 도구 2개 이상 연속 호출
4. "제주에 있는 에펠탑 코스 알려줘" → 지어내지 않고 "결과 없음"

## 📁 폴더 구조

```
├─ api/               Vercel 서버 함수 (tour, weather, heritage, agent, hello)
├─ server/            공공데이터 호출 함수(tools.js) · 에이전트 루프(agent.js)
├─ scripts/           check-supabase.mjs (DB 연결 확인)
├─ supabase/          schema.sql (테이블 + RLS)
├─ docs/              발표자료
└─ src/
   ├─ pages/          Home · World3D · Explore · Agent · Favorites · NotFound
   ├─ components/     RootLayout · ItemCard · CourseScene(Three.js) · HealthCheck
   ├─ store/          useAppStore.js (Zustand)
   ├─ api/            client.js(서버 호출) · supabase.js
   ├─ data/           courses.js (5개 권역·3D 좌표·일주 경로)
   └─ router.jsx      경로 정의
```

## 🚀 실행 방법

```bash
npm install
cp .env.example .env     # 값 채우기 (아래 표)
npm run dev              # http://localhost:5173  (/api/* 도 함께 동작)
node scripts/check-supabase.mjs   # Supabase 연결 확인
```

| 변수 | 설명 |
|---|---|
| `DATA_GO_KR_KEY` | 공공데이터포털 일반 인증키(Decoding) — 관광정보·단기예보 공용 |
| `ANTHROPIC_API_KEY` | Claude API 키 (서버 전용) |
| `VITE_SUPABASE_URL` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable(anon) key |

Supabase **SQL Editor**에서 `supabase/schema.sql`을 한 번 실행하세요.

## ☁ 배포 (Vercel)

1. GitHub에 push → Vercel에서 import (Framework: Vite)
2. Environment Variables에 위 4개 등록 → Redeploy
3. 고정 주소로 제출하고 시크릿 창에서 동작을 확인합니다.

## 🔌 사용한 공공데이터

| API | 용도 |
|---|---|
| 한국관광공사 국문 관광정보 서비스 | 권역별 여행코스·관광지·음식점 |
| 기상청 단기예보 조회서비스 | 날씨에 따른 실내/야외 코스 추천, 3D 하늘 연동 |
| 국가유산청 국가유산 검색 | 코스에 넣을 역사·문화 정차지 |

## 🗒 제작 메모

- 샘플(관광지·날씨·유산 가이드)과 다르게 **권역 3D 지도 + 일주 경로 + 날씨 맞춤 코스 추천**을 중심으로 구성했습니다.
- `.env`는 저장소에 올리지 않습니다(`.gitignore`).
