# Uplink Visual Identity

Uplink should feel like a real aerospace operations platform: calm, precise, observable, and trustworthy. The interface borrows from NASA control rooms and modern observatories without becoming militarized, dystopian, cyberpunk, or generic "hacker" software.

## Palette

- Deep Navy `#06101f`: primary app background.
- Midnight Blue `#0d2037`: elevated surfaces and data regions.
- Observatory Blue `#12304c`: visualization depth and secondary fills.
- Soft Cyan `#8be9ff`: active systems, focus rings, orbital indicators, and primary accents.
- White `#f7fbff`: primary text and selected states.
- Amber `#f5c768`: caution, degraded operations, and watch states.
- Red `#f87171`: rare high-severity alerts only.

Avoid green terminal colors, neon gradients, purple cyberpunk glows, and heavy black/red threat styling.

## Typography

- Display: large, calm, high-confidence titles with medium-to-semibold weight.
- Section titles: compact, scannable, sentence-case operational labels.
- Eyebrows and telemetry: monospaced, uppercase, moderate tracking.
- Body: readable 14-16px text with generous line-height for briefing content.

## Spacing

Use a 4px base rhythm:

- `4px`: hairline offsets and tight icon gaps.
- `8px`: compact gaps and control internals.
- `12px`: card internals and grouped labels.
- `16px`: default panel padding and grid gaps.
- `24px`: major header and section breathing room.
- `32px`: large page rhythm.

## Shape

- Cards and panels: 8px radius.
- Buttons and inputs: 6px radius.
- Pills and meters: fully rounded only when the shape communicates status or progress.

## Interaction

- Hover states should clarify affordance with subtle border, fill, or 1px lift.
- Focus states use cyan outlines with enough contrast.
- Loading states use a quiet horizontal scan, not glitching or terminal effects.
- Status indicators can pulse slowly when live, but motion should stay restrained.

## Components

- Primary button: cyan fill, dark text, used for the main operator action.
- Secondary button: translucent cyan surface, used for safe supporting actions.
- Quiet button: low-contrast surface, used for logs and secondary navigation.
- Warning button: amber tint, reserved for cautionary workflows.
- Alert cards: severity is communicated through border/fill/tone, with red used sparingly.
- Panels: dark translucent surfaces with thin cyan-white borders and soft depth.
