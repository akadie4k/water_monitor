# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: the Walailak University research team (researchers and students) running the Smart Water Buoy prototype. They read Sentinel-2 water-quality indices for one pond in Walailak Botanic Park, compare dates, and decide when buoy readings and lab samples are worth pairing for calibration. They use it indoors on a laptop or desktop during the day, and outdoors on a phone beside the pond in bright sun. The layout must work at 375, 768 and 1440 px.

## Product Purpose

The app shows how turbid and how algae-rich one specific pond is, using Sentinel-2 imagery sampled at the buoy point (8.638917, 99.882260). When the page opens, the user should see the latest clear scene's overlay on the map: how the water looks now. Secondary tasks: browse or filter scenes by clear-sky fraction, switch overlay (NDTI, estimated turbidity in FNU, NDCI, estimated chlorophyll-a in µg/L, true colour), change opacity and basemap, read the index trend at the buoy over time, and trigger a fresh Earth Engine pull.

## Positioning

The app covers one water body only, measured at one physical buoy and checked from orbit. It is not a generic GIS viewer. Values are honest about their limits: NDTI and NDCI are unitless indices, and the FNU and µg/L figures are research-formula estimates that have not been calibrated for this pond. Buoy sensor data is currently simulated.

## Constraints

- All UI text is in Thai. Fonts must render Thai well.
- UI colours: no green, purple or teal. Status colours are good = blue, warn = amber and bad = red, and all must meet WCAG AA. Data ramps are exempt from this rule because they must match the backend's GEE VIS palettes, and the chlorophyll ramp includes greens.
- Icons are Font Awesome Free through a single Icon wrapper. No emoji.
- It is a single-page app with no navigation menu. The header holds only an empty logo slot on the left and the user's avatar and name on the right. The site name "Walailak Botanic Park" appears on or near the map.
- Micro-interactions are subtle and friendly, and prefers-reduced-motion is respected.

## Brand

Logo is pending: the user will design it. The header keeps an empty slot for it.
