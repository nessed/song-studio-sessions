# Sessions — Design System & UX Manual

This document is the visual and experiential source-of-truth for Sessions. It supplements [README.md](README.md) (which describes *what* the app does) by describing *how it should look, feel, and behave*. Every screen, component, and interaction in the codebase is expected to conform to the rules below.

The aesthetic has a name: **Floating Glass on a Dark Console**.

---

## 1. Design philosophy

Sessions is a **boutique** workspace, not a productivity dashboard. The visual language borrows from three reference points:

1. **Mastering studio hardware** — matte black surfaces, faint chrome edges, monospaced readouts, deliberate weight.
2. **High-end art-gallery websites** — generous negative space, oversized typography, photography that sits directly on the page rather than inside frames.
3. **macOS Big Sur glassmorphism** — frosted, translucent floating elements that hover above content rather than partition it.

The combination is intentional. The canvas is quiet and dark so that **cover art and waveforms become the loudest objects on screen**, and floating controls feel like physical hardware drifting in space.

### 1.1 First principles

- **The cover art is the theme.** Every song page recolors itself around the dominant tones extracted from its cover. The UI is a vessel; the song is the subject.
- **No frames around content.** Lists, galleries, and grids sit directly on the background. Use *spacing*, not *cards*, to imply structure.
- **Controls float.** Anything that persists across scroll (the audio player, the upload bar, share modals) is a frosted capsule hovering above the canvas.
- **Quiet by default, loud on intent.** Hover, focus, and active states reveal information. At rest, the UI is calm.
- **Empty space is composition, not absence.** Never apologize for empty state with placeholder text. Render a real component sized to the slot.

---

## 2. Color system

### 2.1 Base palette

The app is dark-first and stays dark. The light scheme exists in [index.css](src/index.css) for `prefers-color-scheme: light` but is not the canonical experience.

| Token | Value | Use |
|------|-------|-----|
| **Canvas** | `#09090b` (deep charcoal) | Page background, the "console" the UI floats on. **Never pure black, never a default gray.** |
| **Surface (raised)** | `#0f1115` | Subtle elevation: nav rails, popovers, sheet surfaces. |
| **Surface (top)** | `#111318` | Top-most layer in stacked panels. |
| **Foreground primary** | `hsl(0 0% 98%)` | Body text, headings. |
| **Foreground secondary** | `hsl(0 0% 60%)` | Sub-labels, metadata. |
| **Foreground muted** | `hsl(0 0% 40%)` | Hints, placeholders, time codes. |
| **Border** | `rgba(255,255,255,0.06)` | Hairlines between rows. Almost invisible by design. |
| **Border (interactive)** | `rgba(255,255,255,0.10)` | Glass capsule outlines. |
| **Destructive** | `hsl(0 65% 50%)` | Delete confirmations only. |

### 2.2 Dynamic per-song palette

Every song detail screen is wrapped in `SessionThemeProvider` ([SessionThemeProvider.tsx](src/components/SessionThemeProvider.tsx)). When a cover image loads, [color-extraction.ts](src/lib/color-extraction.ts) and [palette.ts](src/lib/palette.ts) extract a **dominant**, **vibrant**, and **muted** color from the artwork using `node-vibrant`. Those values are written to CSS custom properties (`--accent-warm`, `--accent-cool`, etc.) and inherited by:

- The mesh-gradient background ([MeshGradient.tsx](src/components/MeshGradient.tsx), [CoverBackground.tsx](src/components/CoverBackground.tsx)).
- The waveform stroke.
- The status pill and the active task accent.
- Glow shadows on the floating player.

This is the single most important visual mechanic in the product. **Every song feels like its own room.**

### 2.3 What not to do

- ❌ Don't use `bg-card`, `bg-muted`, `border`, or `shadow-sm` to wrap lists or grids.
- ❌ Don't use pure `#000` or generic Tailwind `gray-*`. Always go through the design tokens.
- ❌ Don't introduce a new accent color. The accent is whatever the cover art says it is.

---

## 3. Typography

### 3.1 Font stack

| Role | Family | Weight | Tracking |
|------|--------|--------|----------|
| **Display / headings** | Syne (or system fallback) — declared as `font-display` | Bold (700) | Tight |
| **UI / body** | Space Grotesk | 400 / 500 | Normal |
| **Mono (data, time, BPM, key, durations)** | Space Mono / Geist Mono — declared as `font-mono` | 400 | Normal |

Sans stack is configured in [tailwind.config.ts](tailwind.config.ts#L78-L86); display and mono are loaded from the document head.

### 3.2 Scale

The app uses Tailwind's scale plus one custom step `2xs` (`0.625rem`, line-height `0.875rem`) for micro-labels above mono readouts.

- Page titles: `text-4xl` to `text-6xl`, `font-display`, tight leading.
- Section headings: `text-sm` uppercase tracking-wider, muted foreground.
- Body: `text-sm` to `text-base`.
- Metadata (BPM, key, durations, timestamps): `font-mono`, often `text-xs` or `text-2xs`, secondary or muted.

### 3.3 Voice

UI copy is **terse and lower-stakes**. "Create a song" not "Create your first song now!". Empty-state copy is descriptive, not promotional. Errors are surfaced as toasts via [sonner](https://sonner.emilkowal.ski), never as inline red text.

---

## 4. Layout system

### 4.1 Page structure

```
┌──────────────────────────────────────────────────────────┐
│  AppHeader (logo + nav + profile)                        │  ← thin, no border
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Main content (gallery on canvas)                        │
│                                                          │
│                                          ┌─────────────┐ │
│                                          │ Task drawer │ │  ← right-side Sheet
│                                          └─────────────┘ │
│                                                          │
│            ╭───────────────────────────╮                 │
│            │  Floating Audio Player    │ ← bottom-8      │
│            ╰───────────────────────────╯                 │
└──────────────────────────────────────────────────────────┘
```

### 4.2 Grid

- The container is centered with `max-w` constraints rather than full-bleed; padding is `2rem` (`container` config in tailwind.config.ts).
- Vertical rhythm: section spacing is `space-y-12` to `space-y-16`. Inside a section, item spacing is `gap-6` to `gap-8`.
- The song-detail page uses a two-column rhythm at `lg`: lyrics + metadata column, audio + notes column. Both collapse to a single column on mobile.

### 4.3 The right-side task drawer

Tasks **never** live in the main column. They are pushed into a Radix `Sheet` opened from a button in the song header, implemented in [SmartTaskPanel.tsx](src/components/SmartTaskPanel.tsx). This keeps the workspace focused on the song itself; tasks are a sidecar, not a centerpiece.

---

## 5. Surfaces

### 5.1 The canvas

The page background is the deep charcoal `#09090b`. On song detail pages, a slow, low-contrast mesh gradient ([MeshGradient.tsx](src/components/MeshGradient.tsx), powered by `whatamesh`) drifts behind everything, tinted by the cover-art palette. The mesh moves slowly enough to be ambient, never distracting.

### 5.2 Gallery mode (the default)

Lists, song libraries, and project grids are **gallery layouts**: images sit directly on the canvas with `gap-6`. There is no card chrome, no border, no shadow. Hover states reveal a faint background tint (`hover:bg-white/[0.02]`) and a small chevron — that is the entire affordance.

### 5.3 Floating glass capsules

Every persistent floating element follows the same recipe:

```
bg-[#09090b]/80
backdrop-blur-2xl
border border-white/10
shadow-2xl
rounded-full
```

This applies to:
- The audio player ([GlassAudioPlayer.tsx](src/components/GlassAudioPlayer.tsx)).
- The upload bar (empty-state player slot).
- The share modal trigger.
- The onboarding tour hint bubbles.

A capsule's height is consistent so that swapping (e.g. upload bar → player) doesn't cause layout shift.

### 5.4 Lists and rows

Rows are separated by `border-b border-white/5` — a hairline so faint it reads as rhythm, not structure. The row itself has no background until hover.

---

## 6. Components — visual contracts

### 6.1 Inputs

**Ghost inputs**: `bg-transparent`, no border, large type, a single hairline `border-b border-white/10` that thickens on focus. The input dissolves into the canvas; only the cursor and the typed text are visible. This is used everywhere the user is composing content (song title, task title, note body, lyrics).

Form-style inputs (auth, settings) get a slightly more conventional Radix/shadcn treatment but still avoid the bright outlined look.

### 6.2 Buttons

- **Primary**: solid white pill on dark, `text-foreground-inverse`, used sparingly (final commit actions: "Create song", "Share").
- **Secondary**: ghost button, `text-secondary`, no background, gains a faint white wash on hover.
- **Icon-only**: 32×32 circular hit target, `lucide-react` icon at 16–18px, ghost background.

### 6.3 Audio player

The capsule shows, from left to right: cover thumbnail · play/pause · scrubber with waveform · time readout (mono) · stems toggle · share. The waveform stroke uses the cover-art accent color. Time is throttled to 250 ms updates ([SongDetail.tsx](src/pages/SongDetail.tsx#L51-L58)) so the DOM doesn't thrash.

### 6.4 Jog wheel & faders

Stem mixing uses bespoke controls: a `JogWheel` ([JogWheel.tsx](src/components/JogWheel.tsx)) for fine scrub and `StudioFader` ([StudioFader.tsx](src/components/StudioFader.tsx)) for per-stem volume. Both are tall, mono-labeled, and use Framer Motion's `drag` for momentum.

### 6.5 Lyrics editor

Lyrics are edited line-by-line, with section labels (Verse, Chorus, Bridge) treated as muted typographic dividers, not as boxed headers. Components live under [src/components/lyrics/](src/components/lyrics/).

### 6.6 Timeline notes

Notes appear as small dots along the waveform at their timestamp, and as a vertical timeline below the player. Clicking a dot or a row seeks the playhead. Guest notes on shared pages get a subtle "guest" badge and the guest's name in mono.

### 6.7 Smart task card

Each task ([SmartTaskCard.tsx](src/components/SmartTaskCard.tsx)) shows: priority indicator (small colored dot), title, optional due date (mono), checkbox on the right. Done tasks are not removed — they collapse to muted foreground with a strikethrough. The accent dot uses the cover-art palette.

### 6.8 Status pill

The song status (Idea → Release Prep) is a small pill in the song header. It uses the cover-art palette's muted tone for the background and the vibrant tone for the text. Tapping it opens a Radix `DropdownMenu` to change status.

### 6.9 Toasts

Bottom-center, dark frosted, mono timestamp on info toasts. They never block the floating player — sonner is configured to stack above it.

### 6.10 Loading screen

A single centered logo with a slow scale/opacity breath. Used for `Suspense` fallbacks and protected-route auth checks ([LoadingScreen.tsx](src/components/LoadingScreen.tsx)).

---

## 7. Motion

Motion exists to communicate *state change*, never to decorate. Everything in [tailwind.config.ts](tailwind.config.ts#L94-L112) animation block is 300–400 ms with `ease-out`:

- `fade-in` (0.4 s) for route/page mounts.
- `slide-up` (0.4 s, `translateY(12px) → 0`) for content entering a section.
- `scale-in` (0.3 s, `0.95 → 1`) for modals, popovers, and the share sheet.

Framer Motion is used for:
- Stagger reveals on lists (each row gets `delay: i * 0.03`).
- Drag interactions on faders and jog wheels.
- The floating player's mount/unmount.
- The onboarding tour's spotlight movement.

Never animate longer than 500 ms unless it's the ambient mesh gradient.

---

## 8. Iconography

- **Library**: `lucide-react` only. Sized to `16px` (inline with text) or `18–20px` (button glyphs).
- Stroke width stays at the lucide default; no custom icons unless absolutely necessary.
- Icons inherit `currentColor`. No multicolor or filled icons.

---

## 9. Imagery

Cover art is the hero of the product. Cover images:

- Display at their native aspect ratio, square preferred.
- Have no border, no rounded corners by default on the detail page (the cover is the page).
- Get a subtle `shadow-2xl` only when they float (e.g. in a card-like slot on the dashboard list).

External cover URLs are pulled through the [image-proxy edge function](supabase/functions/image-proxy/) so the client can read pixels for palette extraction without hitting CORS.

---

## 10. Responsive behavior

- **Mobile-first defaults** — a single column, the player stays fixed at `bottom-4` instead of `bottom-8`, drawers cover full width.
- **`md` and up** — two-column song detail, side drawers cap at `~420px`, gallery grids go to 2–3 columns.
- **`lg` and up** — three-column dashboard (nav + library + recent projects), drawers float rather than full-cover.
- Touch targets stay ≥ 40 px even when visual size is smaller.

---

## 11. Accessibility

- Color contrast against `#09090b`: primary foreground (`hsl(0 0% 98%)`) gives ~19:1; secondary (`60%`) gives ~6:1 (passes AA for body text); muted (`40%`) is for non-essential metadata only.
- Every Radix primitive in [src/components/ui/](src/components/ui/) ships with keyboard navigation and ARIA. Don't replace them with raw `<div>`s.
- The floating player has labeled controls (`aria-label` on play/pause/seek/stem-toggle).
- Focus rings are not removed; they use `--ring` (a soft white at low alpha) so they're visible against the canvas without being garish.

---

## 12. User flows (UX narratives)

### 12.1 First-time user
1. Lands on `/` (Index) — a quiet hero with one CTA.
2. Sign up at `/auth`.
3. Lands on `/dashboard`. The `OnboardingTour` runs once, highlighting: nav, the create-song input, the song list, the profile menu.
4. Types a song title → presses Enter → routed to `/song/:id`.
5. On `/song/:id` they see an empty workspace with the **UploadBar capsule** in the player slot. Drops an MP3 → it becomes the first version → the capsule swaps into the **GlassAudioPlayer** with no layout shift.

### 12.2 Returning user, working session
1. `/dashboard` shows songs sorted by `updated_at` desc.
2. Click a song → workspace loads with cover, lyrics, player, notes timeline.
3. Press space to play. Scrub. Click the **+** at the playhead to add a timestamped note. Type. Done.
4. Open the task drawer (right side). Type `record harmonies !high due fri` → parsed into a Recording-section task with high priority and a Friday due date.
5. Upload a new mix → it appears as v2 in the version dropdown, becomes current automatically.

### 12.3 Sharing
1. From the song header, open **Share**. Toggle public. A `/s/:hash` link is generated.
2. Recipient opens the link → sees a clean read-only version of the workspace: cover, lyrics, player, notes.
3. Recipient drops a timestamped note under a guest name. Owner sees it in their workspace, tagged as a guest note.

### 12.4 Status progression
A song moves through the seven-stage pipeline by changing its **status pill**, not by being moved between columns. There is no kanban. The status colors the smart-task drawer's section header so the user can see at a glance which stage they're in.

---

## 13. Don'ts (quick reference)

- ❌ No card wrappers around lists.
- ❌ No pure black background.
- ❌ No external audio libraries.
- ❌ No `useEffect` for data fetching.
- ❌ No tasks in the main view.
- ❌ No "Nothing here yet" placeholders — render a real component.
- ❌ No bright outlined inputs in compose surfaces.
- ❌ No new accent color — use the cover-art palette.
- ❌ No animations longer than 500 ms (the mesh is the exception).
- ❌ No icons outside `lucide-react`.

---

## 14. Files that define the system

| Concern | File |
|--------|------|
| Tailwind tokens, fonts, animations | [tailwind.config.ts](tailwind.config.ts) |
| CSS custom properties (palette, surfaces, ring) | [src/index.css](src/index.css) |
| Per-song dynamic theme | [src/components/SessionThemeProvider.tsx](src/components/SessionThemeProvider.tsx) |
| Palette extraction | [src/lib/color-extraction.ts](src/lib/color-extraction.ts), [src/lib/palette.ts](src/lib/palette.ts), [src/hooks/useCoverPalette.ts](src/hooks/useCoverPalette.ts) |
| Mesh gradient background | [src/components/MeshGradient.tsx](src/components/MeshGradient.tsx), [src/components/CoverBackground.tsx](src/components/CoverBackground.tsx) |
| Floating glass player | [src/components/GlassAudioPlayer.tsx](src/components/GlassAudioPlayer.tsx) |
| Empty-state upload capsule | [src/components/AudioPlayer.tsx](src/components/AudioPlayer.tsx) |
| Right-side task drawer | [src/components/SmartTaskPanel.tsx](src/components/SmartTaskPanel.tsx) |
| Hardware-style controls | [src/components/JogWheel.tsx](src/components/JogWheel.tsx), [src/components/StudioFader.tsx](src/components/StudioFader.tsx) |
| Onboarding tour | [src/components/OnboardingTour.tsx](src/components/OnboardingTour.tsx) |
| Project rules (must obey) | [agents.md](agents.md) |

If you are unsure whether a design decision fits, the test is simple: **does it make the song louder, or the chrome louder?** Make the song louder.
