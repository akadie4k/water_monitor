---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: []
---

# Surface brief: satellite dashboard (/)

Scope: the single-page app (no navigation). Mode: Operate. Audience: Walailak research team, laptop indoors and phone by the pond. Job: see the latest clear scene's overlay first, then browse scenes, switch layers, read the buoy-point trend, trigger an Earth Engine refresh. Constraints live in PRODUCT.md.

Chosen direction: B "Survey sheet" (user pick), mixed with C's barcode timeline and A's friendly micro-interactions, by the user's request.

## Direction contract

THESIS: The pond is read like a Royal Thai Survey map sheet — a neatline collar with live graticule ticks frames the map, a margin column carries the sheet's marginal information. Refuses the generic card-grid GIS dashboard with floating glass panels.

OWN-WORLD: Sheet #FAFAF7 ground, white paper panels, ink #15181C neatlines (1.5px) and hairline rules #D6D3CB, hydrographic blue #1A5FB4 for water, selection and "good", contour sienna #8E4F22 for collar figures and section labels; amber #9A5800 / red #B42318 only for warn/bad. Square corners, no shadows except map popups. Bai Jamjuree (drafting-room labels, coordinates) + Noto Sans Thai (body, tabular figures).

STORY: The researcher lands on the newest usable scene already overlaid on the pond, reads its values in the margin, scrubs the 12-month clear-sky barcode to compare dates, switches layer/opacity/basemap, and refreshes from Earth Engine when a new pass is due.

FIRST VIEWPORT: Header (empty logo slot left, avatar + name right). Desktop: sheet ~70% width — title "Walailak Botanic Park" + location line, collar with tick labels, MapLibre map ~62vh with buoy marker, zoom/reset, legend; margin column ~360px on the right — big selected date, buoy values grid, layer radios, opacity, basemap. Scene index (barcode + table, refresh = primary action) starts directly below the sheet. Mobile: title, map 56vh, then margin blocks, index, chart.

FORM: B, Survey sheet, my top-ranked grounded candidate (IMPECCABLE'S PICK), seed: 728f411cae9b812a. Signature move: graticule collar ticks follow the live map and light up under the cursor with a DMS readout. Donations by user request: C's clear-sky barcode scrubber (bar height = clear fraction, drag / arrow keys / play), A's buoy ripple, speech bubble and refresh droplets. Motion grammar: short exponential ease-out, one highlight wash on the values panel per scene change; all off under prefers-reduced-motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
