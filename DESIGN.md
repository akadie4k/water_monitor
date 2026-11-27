---
name: Smart Water Buoy
description: One pond in Walailak Botanic Park, read like a survey map sheet from Sentinel-2 at the buoy point.
colors:
  sheet: "#fafaf7"
  paper: "#ffffff"
  ink: "#15181c"
  body: "#2b2f35"
  muted: "#5a5f66"
  rule: "#d6d3cb"
  rule-soft: "#e9e6df"
  hover: "#f4f2ec"
  hydro: "#1a5fb4"
  hydro-hover: "#144c91"
  hydro-tint: "#e3edf8"
  sienna: "#8e4f22"
  good: "#1a5fb4"
  warn: "#9a5800"
  warn-fill: "#f2a93b"
  warn-tint: "#fdf3e1"
  bad: "#b42318"
  bad-tint: "#fcecea"
typography:
  display:
    fontFamily: "Bai Jamjuree, Noto Sans Thai, system-ui, sans-serif"
    fontSize: "clamp(26px, 2.4vw, 32px)"
    fontWeight: 600
    lineHeight: 1.25
  headline:
    fontFamily: "Bai Jamjuree, Noto Sans Thai, system-ui, sans-serif"
    fontSize: "clamp(22px, 2.6vw, 30px)"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.01em"
  title:
    fontFamily: "Bai Jamjuree, Noto Sans Thai, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.25
  title-margin:
    fontFamily: "Bai Jamjuree, Noto Sans Thai, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.02em"
  body:
    fontFamily: "Noto Sans Thai, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "Noto Sans Thai, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.6
  value:
    fontFamily: "Noto Sans Thai, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.5
    fontFeature: "tnum"
  label:
    fontFamily: "Noto Sans Thai, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.33
  collar:
    fontFamily: "Bai Jamjuree, Noto Sans Thai, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1
rounded:
  none: "0px"
  mark: "9999px"
spacing:
  hair: "1px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  gutter: "28px"
components:
  button-primary:
    backgroundColor: "{colors.hydro}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "44px"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "{colors.hydro-hover}"
    textColor: "{colors.paper}"
  button-primary-busy:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.hydro}"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "40px"
  button-outline-hover:
    backgroundColor: "{colors.hover}"
    textColor: "{colors.ink}"
  segmented-on:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    height: "40px"
  segmented-off:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    height: "40px"
  map-control:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    size: "40px"
  map-control-hover:
    backgroundColor: "{colors.hydro-tint}"
    textColor: "{colors.hydro}"
  tag-estimate:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.sienna}"
    rounded: "{rounded.none}"
    padding: "0 6px"
    typography: "{typography.label}"
  panel:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "20px"
  table-row-selected:
    backgroundColor: "{colors.hydro-tint}"
    textColor: "{colors.hydro}"
  value-cell:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "8px 12px"
    typography: "{typography.value}"
---

# Design System: Smart Water Buoy

Human-facing companion: `design-system/MASTER.md` at the repository root. This file is derived from the shipped build (`app/globals.css` `@theme static`, `components/**`); where the two disagree, the code and this file win.

## Overview

**Creative North Star: "The Survey Sheet" (ระวางแผนที่)**

The pond is read like a Royal Thai Survey topographic map sheet. The map sits inside a neatline collar whose graticule ticks follow the live map and light up under the cursor; a margin column beside it carries the sheet's marginal information (which scene, what values, which layer); an index below lists every pass. Everything is drawn in two inks on paper: near-black ink for neatlines and headings, hydrographic blue for water and for whatever the researcher has selected, with contour sienna as the cartographer's second ink for collar figures and margin headings.

Density is that of a working instrument, not a marketing page: hairline rules, tabular figures, square corners, flat paper. Warmth comes from motion and voice rather than decoration: the buoy pin ripples, it greets you in a speech-bubble popup, a fresh Earth Engine pull scatters a few droplets, and the values panel washes blue once when the scene changes. All of it is short, exponential ease-out, and disappears under reduced motion.

It refuses the generic card-grid GIS dashboard with floating glass panels: panels are bordered paper on a paper ground, not lifted cards.

**Key Characteristics:**
- Two inks on paper: ink neatlines (1.5px) and hairline rules, hydro blue for water and selection.
- Square corners everywhere except true point marks (buoy pin, avatar).
- Flat by default; only floating layers over the map or page cast a shadow.
- Drafting-room type (Bai Jamjuree) for headings, coordinates and figures; Noto Sans Thai with tabular figures for reading and numbers.
- Status speaks blue / amber / red; no green, purple or teal in UI chrome.
- Friendly micro-motion, always expo ease-out, always off under `prefers-reduced-motion`.

## Colors

A restrained paper-and-ink palette where one blue does the real work and sienna is a quiet second ink.

### Primary
- **Hydrographic Blue** (hydro): water, the primary action (refresh), selection (barcode cursor, selected row, active map control), focus ring, `::selection`, form accent colour, and the "good" status. Its hover deepens to **Deep Hydro** (hydro-hover). **Hydro Tint** is the selected-row fill, progress-banner fill, map-control hover and the values wash.

### Secondary
- **Contour Sienna** (sienna): collar coordinate figures, margin-column section headings, the year marks under the barcode, the "ประมาณ" (estimate) tag text, the "หมายเหตุ" lead-in, and the NDCI chart series. Never a fill, never a button.

### Tertiary (status only)
- **Survey Amber** (warn) for warn text, **Amber Fill** (warn-fill) for warn bars, **Amber Note** (warn-tint) for the estimate caveat background.
- **Survey Red** (bad) for bad text, cloudy barcode bars and errors; **Red Note** (bad-tint) for error backgrounds.
- **Good** is the same value as hydro by rule, not a separate hue.

### Neutral
- **Sheet** (sheet): the page ground, a faintly warm map paper.
- **Paper** (paper): every panel, the header, controls, popups, toasts.
- **Ink** (ink): headings, neatlines, collar ticks, chart axes, the selected segmented button.
- **Body** (body): running text.
- **Muted** (muted): secondary lines, meta, axis labels, units.
- **Rule** (rule): panel borders, section dividers, barcode day ticks, scrollbar.
- **Rule Soft** (rule-soft): table row rules, value-grid gaps, chart split lines, skeleton loaders, the map's empty ground.
- **Hover** (hover): row and outline-button hover.

### Named Rules
**The Two Inks Rule.** Chrome is ink and hydro on paper. Sienna marks figures and margin headings; amber and red appear only when a value is actually in a warn or bad state.

**The No-Green Chrome Rule.** No green, purple or teal anywhere in UI chrome; good is blue. Data ramps in `lib/indices.ts` are exempt because they must match the backend's GEE `VIS` palettes, and the chlorophyll ramp contains greens. Ramps render only inside the map overlay, the legend bar and the layer-swatch chips.

**The On-Tint Ink Rule.** Text set on a tint uses a darker ink of the same hue for AA contrast (deep red on bad-tint, deep blue on hydro-tint, deep amber on warn-tint), never the base status colour.

## Typography

**Display Font:** Bai Jamjuree 500/600 (via `--font-drafting`, falling back to Noto Sans Thai, system-ui)
**Body Font:** Noto Sans Thai 400/500/600 (via `--font-body`, falling back to system-ui)

**Character:** Bai Jamjuree's squared drafting-room letterforms make headings, coordinates and collar figures read like lettering on a survey sheet; Noto Sans Thai carries Thai reading text and every number with tabular figures.

### Hierarchy
- **Display** (600, clamp 26–32px, 1.25): the selected scene's date at the top of the margin column. One per page.
- **Headline** (600, clamp 22–30px, 1.25, +0.01em): the sheet title "Walailak Botanic Park".
- **Title** (600, 20px): section headings for the scene index and the buoy-point chart.
- **Title, margin** (600, 15px, +0.02em, sienna): section headings inside the margin column ("ชั้นข้อมูล").
- **Body** (400, 15px, 1.6): base text; controls and header name use it at weight 500.
- **Body small** (400, 13px): meta lines under headings, filters, counts, chart notes; usually muted. Long notes cap at 78ch.
- **Value** (600, 18px, tabular): buoy-point readings in the margin value grid.
- **Label** (400, 12px): value-cell labels, legend scale, units, tags, caveat notes.
- **Collar** (Bai Jamjuree 500, 11px, sienna): graticule tick labels and the scale bar.

### Named Rules
**The Tabular Figures Rule.** Every number that can change (values, percentages, counts, coordinates) is set with tabular figures so columns and readouts do not jitter.

**The Drafting Hand Rule.** Bai Jamjuree is for headings, coordinates, table headers, the legend title and empty-state titles. Paragraphs and table cells stay in Noto Sans Thai.

## Layout

A centred sheet up to 1520px wide on the paper ground, with 12 / 24 / 32px side gutters at phone / 640px / 1024px. Below 1024px everything is one column in reading order: status banner, map sheet (title, collar, map, barcode), margin column, scene index, chart. From 1024px the grid is `1fr | 360px`: the map sheet fills the left, the margin column sits right and sticks under the header (top 80px, scrolls internally if taller than the viewport), and the index and chart span both columns beneath. Column gap 28px, row gap 24px.

The map is the first thing on every width: max(320px, 56svh) tall on phones, clamp(400px, 56vh, 700px) on desktop. The collar is a 3x3 grid around it: 48px left / 26px top / 12px right and bottom from 640px, collapsing to 10px edges with only top figures on phones.

Panel interiors use 16–20px padding; sections inside the margin column are stacked and split by a hairline rule rather than separate boxes. Interactive rows and buttons are at least 44px tall on touch (40px for secondary controls from 640px). Spacing steps in 4px increments, mostly 8 / 12 / 16 / 20 / 24.

## Elevation & Depth

Flat. Depth comes from neatlines and rules, not shadow: the map sheet carries a 1.5px ink neatline, other panels a 1px rule border, all on paper over the sheet ground. Shadows exist only where a layer genuinely floats above content.

### Shadow Vocabulary
- **Map popup** (`box-shadow: 0 10px 24px -10px rgb(21 24 28 / 0.45)`): the buoy speech-bubble popup, over the map.
- **Toast** (`box-shadow: 0 8px 20px -10px rgb(21 24 28 / 0.5)`): transient toasts floating at the bottom of the viewport.
- **Label halo** (`text-shadow: 0 0 3px #fff ×3, 0 0 6px #fff`): the cartographic white halo behind the buoy name on the map. Native to map lettering, not elevation.

### Named Rules
**The Neatline Rule.** A box earns weight by its stroke, not its shadow: 1.5px ink for the primary sheet, header base, popups, toasts and table header; 1px rule for secondary panels.

**The Floating-Only Shadow Rule.** A shadow means "this floats over something else" (popup, toast). In-flow panels, cards and controls never cast one.

## Shapes

Square corners throughout: panels, buttons, inputs' containers, tags, popups, toasts, legend, segmented control, map controls (0px). The only circles are point marks that are circles in the world they represent: the buoy pin (22px ring with a 10px hydro core and ripple rings) and the user avatar. Barcode bars are thin vertical strokes (4px, 6px when selected); the barcode cursor is a hairline with a small downward triangle. Empty states use a dashed rule border.

## Components

### Buttons
Square, stroked, decisive.
- **Shape:** square (0px), 1.5px border on the primary, 1px on outline.
- **Primary (refresh):** hydro fill, white 15px/500 text, 16px side padding, 44px tall (40px from 640px), a satellite-dish icon. Only one primary per page.
- **Hover / Active:** fills to hydro-hover; presses to 0.97 scale (150ms). Busy state flips to paper fill with hydro text, a spinning refresh icon and rotating Thai status lines, stacked so the width never changes. Success scatters ten droplets (hydro and sienna, 800ms); failure shakes (360ms).
- **Outline (play, retry):** paper fill, ink 1px border and text, hover fills hover; "playing" state fills hydro. Disabled drops to rule border and muted text.
- **Segmented (basemap):** two square cells inside a 1px ink box; the selected cell is solid ink with white text.

### Chips
- **Estimate tag ("ประมาณ"):** 1px rule border, sienna 12px text, 6px side padding, square. Marks every formula-estimated (uncalibrated) layer.
- **Layer swatch:** a 28x10px bar of the overlay's data ramp with a faint ink border, leading each layer radio.

### Cards / Containers
- **Corner Style:** square (0px).
- **Background:** paper on the sheet ground.
- **Shadow Strategy:** none (see Elevation).
- **Border:** 1.5px ink for the map sheet; 1px rule for the margin column, index and chart sections.
- **Internal Padding:** 16–20px; internal sections divided by a 1px rule.

### Inputs / Fields
- **Style:** native checkbox, radio and range, tinted with hydro via `accent-color`; labels form 44px-tall full-row hit targets that tint on hover and go medium-weight when checked.
- **Focus:** a 2px hydro outline offset 2px on every focusable element.

### Navigation
None by design: a single page. The header is 56px, paper with a 1.5px ink base rule, sticky; it holds only an empty logo slot left and the user's name, role and a hydro initial avatar right.

### Survey Collar (signature)
The neatline frame around the map: ink rules on all four sides with 7px ink ticks at graticule intervals that track the live map, sienna degree-minute-second figures on the top and left, and a 3px hydro cursor band on each edge plus a hairline crosshair and DMS readout box under the pointer. The MapLibre scale bar is restyled as an ink drafting scale.

### Clear-Sky Barcode (signature)
A 96px strip, one vertical bar per scene positioned by date, bar height = clear-sky percentage. Ink bar = usable, outlined bar = cloud over the buoy, red bar = under 30% clear, hydro bar plus hairline cursor = selected. Scrub by drag, step with arrow keys, or play as a time-lapse (1.5s per scene, disabled under reduced motion). Five-day pass ticks sit under the baseline in rule; month labels below, years in sienna drafting type.

### Margin Value Grid
A 2x2 definition grid with 1px rule-soft gaps: 12px muted label over an 18px tabular value with a muted unit. Changing scene replays a 900ms hydro-tint wash once.

### Scene Table
Sticky drafting-type header over a 1.5px ink rule; rows split by rule-soft, hover to hover, selected row hydro-tint with the date in semibold hydro. Clear-sky column pairs a 56px status bar with a status-coloured percentage.

### Buoy Pin and Speech Bubble
A ringed circular pin with two staggered hydro ripples (3.2s, removed under reduced motion), scaling to 1.15 on hover or open. Its popup is a square paper bubble with a 1.5px ink border and the map-popup shadow, in which the buoy introduces itself in first person before listing values.

### Feedback
- **Toast:** bottom-centre, square paper with a 1.5px ink border, status-coloured icon, slides up 8px in 220ms, gone after 3.5s.
- **Status banner:** persistent, full-width square strip; hydro border on hydro-tint for progress, bad border on bad-tint for errors, dismissible.

## Do's and Don'ts

### Do:
- **Do** take every colour from the `@theme static` tokens in `app/globals.css`; JS libraries (ECharts, MapLibre) read them through `lib/theme.ts`.
- **Do** frame the primary surface with a 1.5px ink neatline and everything secondary with a 1px rule.
- **Do** use hydro for anything selected, focused or "good", and keep it the only fill colour on buttons.
- **Do** set changing numbers in tabular figures and coordinates/figures in Bai Jamjuree.
- **Do** mark every formula-estimated value with "≈" or the "ประมาณ" tag and keep its caveat visible.
- **Do** use the expo ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`) for motion and keep durations between 150ms and 900ms, except the ambient buoy ripple.
- **Do** route every icon through the `Icon` component with a name registered in `lib/icons.ts`.

### Don't:
- **Don't** use green, purple or teal in UI chrome; data ramps are the only exception.
- **Don't** round corners on panels, buttons, tags or popups; circles are only for the buoy pin and the avatar.
- **Don't** put shadows on in-flow panels or cards; shadows belong only to the map popup and toasts.
- **Don't** use emoji or Unicode glyphs as icons.
- **Don't** add a navigation menu, tabs or anything else to the header beyond the logo slot and the user.
- **Don't** ship motion that survives `prefers-reduced-motion`.
