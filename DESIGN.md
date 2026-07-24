# Design

Dark instrument panel. The portfolio reads like precision engineering equipment: warm charcoal surfaces, warm light ink, signal orange used as instrumentation (rules, numerals, active states), never decoration. Reference lane: engineering spec sheet / instrument manual, not hacker terminal, not editorial magazine.

## Theme

Dark only. Scene: developer's own surface; visitors meet it as a built object, panel lit from within. No light mode planned.

## Color

All values OKLCH, defined in `css/base.css`. Neutrals tinted toward hue 40 (warm), never pure gray or `#000`/`#fff`.

| Token | Value | Role |
| --- | --- | --- |
| `--panel-0` | oklch(0.16 0.008 40) | Deepest background, footer, wells |
| `--panel-1` | oklch(0.19 0.009 40) | Page background |
| `--panel-2` | oklch(0.23 0.01 40) | Raised surfaces |
| `--panel-3` | oklch(0.27 0.012 40) | Highest surfaces, hover fills |
| `--line-0` | oklch(0.26 0.01 40) | Hairlines |
| `--line-1` | oklch(0.33 0.012 40) | Visible borders |
| `--ink-1` | oklch(0.93 0.008 40) | Primary text |
| `--ink-2` | oklch(0.72 0.015 40) | Secondary text |
| `--ink-3` | oklch(0.56 0.015 40) | Faint text, meta |
| `--signal` | oklch(0.68 0.18 40) | Signal orange: accents, active, rules, numerals |
| `--signal-strong` | oklch(0.74 0.17 45) | Hover on signal elements |
| `--signal-dim` | oklch(0.58 0.16 40) | Pressed, gradients, secondary signal |
| `--signal-tint` | oklch(0.25 0.045 40) | Orange-washed background areas |
| `--ok` | oklch(0.75 0.13 150) | Availability dot only |

Strategy: Committed. Orange carries identity through section numerals, rules, key type moments; not confined to tiny accents, but body text stays ink on panel. No gradients as decoration (legacy gradients being phased out per section).

## Typography

- `--font-display` / `--font-body`: **Archivo** (variable: wdth 62-125, wght 100-900). Headings: wide (wdth 110-125), heavy (700-800), tracking -0.02em. Body: wdth 100, wght 400-500.
- `--font-mono`: **Fragment Mono**. Labels, section numerals, dates, stats, metadata. Uppercase + `--tracking-wide` (0.08em) for labels.
- Scale (ratio >= 1.25): `--text-xs` 0.75rem, `--text-sm` 0.875rem, `--text-base` 1rem, `--text-lg` 1.25rem, `--text-xl` clamp to 2rem, `--text-2xl` clamp to 3.25rem, `--text-display` clamp to 6.75rem.
- Body line-height 1.65 (light-on-dark needs air). Body copy max 70ch.
- Banned: DM Sans, Space Grotesk (removed), gradient text, all-caps body copy.

## Shape & Space

- Radii near-sharp: `--radius-1` 2px default, `--radius-2` 6px max. No pill buttons, no large rounded cards.
- Spacing tokens `--space-1` through `--space-24`; section rhythm via `--space-section` clamp(4rem to 9rem). Vary density: tight inside groups, generous between sections.
- Grid is visible voice: hairlines (`--line-0`), section numerals (`01`, `02` in mono + signal), aligned columns. Asymmetry over centered stacks.

## Components (grammar, applied per section during redesign)

- **Section header**: mono signal numeral + rule + Archivo wide title. No "subtitle that restates title".
- **Buttons**: rectangular, 2px radius. Primary: signal fill, panel-0 text. Secondary: 1px `--line-1` border, ink text, signal border on hover.
- **Labels/meta**: Fragment Mono, `--text-xs`/`--text-sm`, uppercase, tracked, `--ink-3`.
- **Status**: `--ok` dot + mono label for availability.

## Motion

- `--ease-out` cubic-bezier(0.16, 1, 0.3, 1); durations 150/300/600ms.
- Transform + opacity only; never layout properties.
- `prefers-reduced-motion` globally respected (see base.css).

## Bans (project-specific, on top of impeccable shared bans)

- Sky blue `#38bdf8` family: fully retired.
- Decorative gradients, glassmorphism/blur cards, glow effects.
- Matrix green / cyber neon, even as cybersecurity content grows.
- Identical icon-title-text card grids.
