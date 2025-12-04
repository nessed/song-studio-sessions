# Agents

This project does not require a dedicated agents setup for Codex. If you want to document or manage AI-driven workflows later, this file can track agent roles, responsibilities, and prompts, but no configuration is currently needed.

Suggested structure if you expand this:

- Agent name and purpose
- Input/output expectations
- Safety or approval requirements
- Operational checklist or playbook

Feel free to remove this file if you decide not to use agents.

# AGENTS.md - Project Instructions

## 1. Project Context

- **App Name:** Sessions (Song Studio)
- **Tech Stack:** React (Vite), TypeScript, Tailwind CSS, Supabase, Radix UI (Shadcn).
- **Core Goal:** A minimalist, "boutique" audio workspace for musicians. Not a generic dashboard.

## 2. Visual Design Rules (STRICT)

**Aesthetic:** "Floating Glass" & "Dark Console".

- **Background:** Deep Charcoal (`#09090b`). NEVER use pure black or default gray.
- **Containers:**
  - **NO CARDS:** Do not use `bg-card`, `border`, or `shadow-sm` for lists/grids.
  - **Gallery Mode:** Images and text should sit directly on the background. Use spacing (`gap-6`) to define structure.
  - **Separators:** Use `border-b border-white/5` for lists.
- **Glassmorphism:**
  - All floating elements (Audio Player, Upload Bar) MUST use:
    `bg-[#09090b]/80 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-full`.
- **Typography:**
  - Headings: `font-display` (Syne/Bold).
  - Data/Time: `font-mono` (Space Mono/Geist Mono).

## 3. Technical Rules

- **Data Fetching:** ALWAYS use `@tanstack/react-query`. NEVER use `useEffect` for data fetching.
- **Audio Engine:**
  - **NO External Libraries:** Do not install `wavesurfer.js` or `react-h5-audio-player`.
  - **Standard HTML5:** Use `<audio>` element with `useRef`.
  - **Persistence:** The player must be a **Floating Capsule** fixed at `bottom-8`.
- **State Management:**
  - Use `useQuery` for reads.
  - Use `useMutation` for writes (optimistic updates preferred).

## 4. Behavior & Layout

- **Tasks:** NEVER place tasks in the main view. Always push them to a **Right Sidebar** (Sheet/Drawer).
- **Empty States:** Never leave a section blank.
  - _Bad:_ "No audio."
  - _Good:_ Render an `UploadBar` component that matches the Player's dimensions (prevents layout shift).
- **Inputs:** Use "Ghost Inputs" (`bg-transparent border-none`) that blend into the canvas.
