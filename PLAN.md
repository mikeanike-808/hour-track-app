# Hour Track App — Build Plan

## Overview
A local web app for tracking daily work hours. Clock in, take breaks, clock out. Weekly summary and history. Runs on localhost via `npm run dev`.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | **Next.js 15** (App Router) | Server-side SQLite, simple file routing |
| Frontend | **React 19** | Component-based UI |
| Styling | **Tailwind v4** | Utility-first, fast iteration |
| Storage | **better-sqlite3** | Fast local SQLite, no external DB |
| Utilities | **uuid** | Unique session IDs |

---

## Session State Machine

```
IDLE ──[Clock In]──► WORKING ──[Start Break]──► ON_BREAK
                        ▲                            │
                        └───────[End Break]──────────┘
                        │
                    [Clock Out]
                        ▼
                      IDLE
```

---

## Data Model

SQLite table (`data/hours.db`):

```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  clock_in INTEGER NOT NULL,
  clock_out INTEGER,
  breaks TEXT NOT NULL DEFAULT '[]'  -- JSON array of {start, end?}
)
```

**Computed (never stored):**
- `netWorked = (clockOut ?? now) − clockIn − Σ(break.end − break.start)`
- Timer pauses during ON_BREAK (frozen at last break start − clockIn − prevBreaks)
- `weekTotal = Σ netWorked for all sessions in the ISO week`

---

## Project Structure

```
hour-track-app/
├── src/
│   ├── lib/
│   │   ├── types.ts         # Shared types (Session, AppState, Status, Break)
│   │   ├── db.ts            # better-sqlite3 singleton (server-only)
│   │   ├── sessions.ts      # CRUD helpers (server-only)
│   │   └── format.ts        # Formatting utilities (client-safe)
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx       # Root layout with Nav
│   │   ├── page.tsx         # Today view (polls state every 5s)
│   │   ├── week/page.tsx    # Week view with prev/next navigation
│   │   ├── history/page.tsx # Scrollable past weeks
│   │   └── api/
│   │       ├── state/route.ts
│   │       ├── clock-in/route.ts
│   │       ├── clock-out/route.ts
│   │       ├── break-start/route.ts
│   │       ├── break-end/route.ts
│   │       └── sessions/
│   │           ├── today/route.ts
│   │           ├── week/route.ts    (?start=YYYY-MM-DD)
│   │           └── history/route.ts
│   └── components/
│       ├── Nav.tsx
│       ├── ClockPanel.tsx   # Status badge + timer + clock in/out + break button
│       ├── DailyLog.tsx     # Today's sessions list
│       ├── WeekGrid.tsx     # Mon–Sun bar chart with day/week totals
│       └── WeekHistory.tsx  # Stacked week cards with bar charts
├── data/                    # SQLite DB lives here (auto-created)
├── next.config.js
├── postcss.config.mjs
└── package.json
```

---

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/state` | GET | Current `{ status, activeSession }` |
| `/api/clock-in` | POST | Start new session |
| `/api/clock-out` | POST | End active session (auto-closes open break) |
| `/api/break-start` | POST | Begin a break |
| `/api/break-end` | POST | End active break |
| `/api/sessions/today` | GET | Today's sessions |
| `/api/sessions/week?start=` | GET | Sessions for a given week |
| `/api/sessions/history` | GET | All weeks with sessions |

---

## Verification Checklist

- [ ] `npm run dev` — app opens at localhost:3000
- [ ] Clock In → timer counts up live
- [ ] Start Break → timer pauses; End Break → timer resumes
- [ ] Clock Out → session appears in Today log with correct net time
- [ ] Restart / reload — sessions persist via SQLite
- [ ] Week view shows Mon–Sun bar chart with totals
- [ ] Week nav prev/next works
- [ ] History tab shows past weeks with mini bar charts
