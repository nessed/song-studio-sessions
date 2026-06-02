# Sessions — Song Studio

A boutique, web-based studio workspace for solo musicians and small production teams. Sessions is built around a single idea: every song is a living session — audio, lyrics, notes, tasks, references, and versions all live in one place and evolve together from first idea to release.

It is intentionally **not** a generic dashboard, not a DAW, and not a file dump. It is a focused songwriting and production companion that sits between a notebook, a reference player, and a producer's task list.

---

## 1. What the app does (in one paragraph)

Sessions lets a musician create songs, group them into projects, upload mixes and stems, add timestamped notes to a track, write and sync lyrics, manage stage-based tasks (Idea → Writing → Recording → Production → Mixing → Mastering → Release Prep), and share a song publicly via a read-only link so collaborators can leave feedback at specific timestamps without logging in.

---

## 2. Core feature set

### 2.1 Songs
- Create, rename, delete songs.
- Per-song metadata: **title, BPM, key, mood tags, cover art, reference link**.
- **Status pipeline**: `idea` → `writing` → `recording` → `production` → `mixing` → `mastering` → `release_prep`.
- Cover art upload → automatic color-palette extraction (`node-vibrant` + custom palette logic in [color-extraction.ts](src/lib/color-extraction.ts)) — the entire song detail page re-themes around the cover art's dominant colors.
- Lyrics editor with line-by-line structure ([LyricsEditor.tsx](src/components/LyricsEditor.tsx) + [lyrics/](src/components/lyrics/)).

### 2.2 Versions
- Each song can hold multiple uploaded MP3 versions ([useSongVersions.ts](src/hooks/useSongVersions.ts)).
- One version is marked **current**; the floating player always plays the current version.
- Upload progress is tracked and surfaced in the UI.
- Versions can be promoted, swapped, or deleted.

### 2.3 Stems
- Each version can carry **stems**: vocals, drums, bass, melody, FX, other ([useSongStems.ts](src/hooks/useSongStems.ts), [StemMixer.tsx](src/components/StemMixer.tsx)).
- Per-stem **volume slider, mute toggle, and label**.
- Stems play in sync with the master version — implemented with raw HTML5 `<audio>` refs (no `wavesurfer.js`, no `react-h5-audio-player`).

### 2.4 Floating audio player
- Persistent **glass capsule** fixed at `bottom-8`, visible across the song detail view ([AudioPlayer.tsx](src/components/AudioPlayer.tsx), [GlassAudioPlayer.tsx](src/components/GlassAudioPlayer.tsx)).
- Play/pause, scrub, current time, duration, waveform visualizer ([WaveformVisualizer.tsx](src/components/WaveformVisualizer.tsx)).
- Time updates are throttled to 250 ms to keep React renders cheap.
- The same capsule shape doubles as an **UploadBar** when no audio is present — prevents layout shift and gives empty states a purposeful component.

### 2.5 Timeline notes
- Add a note anchored to the current playhead time ([TimelineNotes.tsx](src/components/TimelineNotes.tsx), [useSongNotes.ts](src/hooks/useSongNotes.ts)).
- Notes appear in chronological order along the timeline; clicking a note seeks the player to its timestamp.
- **Guest notes** are supported on shared songs — anonymous viewers can leave timestamped feedback under a guest name.

### 2.6 Smart Tasks
- A per-song task list segmented by the same seven sections as the status pipeline ([SmartTaskPanel.tsx](src/components/SmartTaskPanel.tsx), [SmartTaskCard.tsx](src/components/SmartTaskCard.tsx), [useTasks.ts](src/hooks/useTasks.ts)).
- Each task: title, **priority** (high / medium / low), **due date**, done state, sort order.
- Tasks live in a **right-side drawer** — never in the main view (rule from [agents.md](agents.md)).
- A natural-language parser ([taskParser.ts](src/lib/taskParser.ts)) lets users type things like `mix vocals !high due friday` and have them auto-classified.

### 2.7 Projects
- Songs can be grouped into projects (albums, EPs, client work) ([Projects.tsx](src/pages/Projects.tsx), [ProjectDetail.tsx](src/pages/ProjectDetail.tsx), [useProjects.ts](src/hooks/useProjects.ts)).
- Project-level mood tags, description, and cover art.
- The dashboard surfaces the four most recent projects alongside the song library.

### 2.8 Sharing
- Each song can be flipped to **public** with a generated `share_hash` ([ShareModal.tsx](src/components/ShareModal.tsx)).
- Public link: `/s/:hash` → [SharedSongView.tsx](src/pages/SharedSongView.tsx).
- Public viewers can play the current version, read lyrics, view timeline notes, and leave guest notes — but cannot edit anything.

### 2.9 Onboarding
- First-time users get a guided tour over key UI targets (navigation, create-song input, song list, profile) via [OnboardingTour.tsx](src/components/OnboardingTour.tsx) + [useOnboardingTour.ts](src/hooks/useOnboardingTour.ts).

### 2.10 Account & data
- Email/password auth via Supabase ([Auth.tsx](src/pages/Auth.tsx), [useAuth.tsx](src/hooks/useAuth.tsx)).
- Profile page with display name + avatar ([useProfile.ts](src/hooks/useProfile.ts)).
- **Full data export** as JSON (profile + projects + songs + tasks + notes) via [useExportData.ts](src/hooks/useExportData.ts).

---

## 3. Routes

| Path | Component | Access |
|------|-----------|--------|
| `/` | `Index` (landing) | Public |
| `/auth` | `Auth` (sign in / sign up) | Public-only (redirects to `/dashboard` if logged in) |
| `/dashboard` | `Dashboard` (song library + recent projects) | Protected |
| `/song/:id` | `SongDetail` (the main workspace) | Protected |
| `/projects` | `Projects` (grid of all projects) | Protected |
| `/project/:id` | `ProjectDetail` | Protected |
| `/settings` | `Settings` | Protected |
| `/s/:hash` | `SharedSongView` (read-only public song) | Public |
| `*` | `NotFound` | Public |

All protected pages are gated by `ProtectedRoute`; all auth pages by `PublicRoute` (see [App.tsx](src/App.tsx)).

---

## 4. Architecture

### 4.1 Frontend
- **Vite + React 18 + TypeScript** (SWC plugin).
- **React Router v6**, all pages lazy-loaded with `Suspense` + `LoadingScreen` fallback.
- **TanStack Query** for every read and write — `useQuery` for reads, `useMutation` with optimistic updates for writes. **No `useEffect` data fetching.**
- **Framer Motion** for transitions, mounts, and the jog-wheel / fader micro-interactions.
- **Sonner** for toasts (positioned `bottom-center` so it doesn't fight with the floating player).

### 4.2 Backend
- **Supabase** for auth, Postgres, storage, and a single edge function ([image-proxy](supabase/functions/image-proxy/)) used to bypass CORS when extracting palette colors from external cover images.
- Migrations in [supabase/migrations/](supabase/migrations/) define songs, projects, tasks, versions, stems, notes, sharing, and storage policies.

### 4.3 Audio pipeline
- Pure HTML5 `<audio>` + `useRef`, no third-party audio libraries.
- A custom hook `useAudioAnalyzer` ([useAudioAnalyzer.ts](src/hooks/useAudioAnalyzer.ts)) wires Web Audio API for the waveform visualizer.
- Worker code lives in [src/workers/](src/workers/) for off-main-thread tasks.

### 4.4 State boundaries
- **Server state** → TanStack Query (`useSongs`, `useProjects`, `useTasks`, `useSongVersions`, `useSongStems`, `useSongNotes`).
- **UI state** → local `useState` inside the owning component.
- **Cross-cutting** → React context (`AuthProvider`, `ThemeProvider`, `SessionThemeProvider`).

---

## 5. Tech stack

| Layer | Choice |
|------|--------|
| Bundler | Vite 5 |
| Language | TypeScript 5 |
| UI runtime | React 18 |
| Routing | react-router-dom v6 |
| Server state | @tanstack/react-query v5 |
| UI primitives | Radix UI (via shadcn) + NextUI |
| Styling | Tailwind CSS 3, tailwindcss-animate, tailwind-merge |
| Forms | react-hook-form + zod |
| Motion | framer-motion |
| Toasts | sonner |
| Color extraction | node-vibrant + tinycolor2 |
| Backend | Supabase (auth, Postgres, storage, edge functions) |
| Hosting | Vercel ([vercel.json](vercel.json)) |

---

## 6. Running locally

Prerequisites: Node.js 18+ and `npm` (or `bun` — a `bun.lockb` is checked in).

```sh
# 1. Install dependencies
npm install

# 2. Configure Supabase
#    Create a Supabase project and set the URL + anon key
#    (the existing integration lives in src/integrations/supabase/)

# 3. Run the dev server
npm run dev
```

Other scripts:

```sh
npm run build       # production build
npm run build:dev   # build in development mode
npm run preview     # preview built bundle
npm run lint        # eslint
```

---

## 7. Project layout

```
src/
├── App.tsx                  # router + providers
├── main.tsx                 # entry
├── index.css                # design tokens + Tailwind layers
├── pages/                   # one file per route
├── components/              # feature components + ui/ (shadcn primitives)
│   ├── lyrics/              # lyrics editor subcomponents
│   └── ui/                  # shadcn-generated primitives
├── hooks/                   # data hooks (TanStack Query) + utilities
├── lib/                     # pure logic: types, color, palette, task parsing, utils
├── integrations/supabase/   # generated Supabase client + types
└── workers/                 # web workers
supabase/
├── functions/image-proxy/   # CORS proxy for external cover images
└── migrations/              # schema, RLS, storage policies
```

---

## 8. Conventions (enforced)

These are reproduced from [agents.md](agents.md) — they are non-negotiable for any code added to the repo:

- **Data fetching**: always TanStack Query. Never `useEffect` for fetching.
- **Audio**: native `<audio>` + `useRef` only. No `wavesurfer.js`, no `react-h5-audio-player`.
- **The audio player is always a floating capsule at `bottom-8`.**
- **Tasks live in a right-side Sheet/Drawer**, never inline in the main view.
- **Empty states render a real component** (e.g. UploadBar matching the player's footprint), never a "No audio" placeholder.
- **Inputs are ghost inputs** (`bg-transparent border-none`) that dissolve into the canvas.

For the visual / UX rules — palette, typography, glass treatment, spacing, motion — see [READMEDESIGN.md](READMEDESIGN.md).
