# Leak to Fix

## What this is
An agentic AI tool that closes the gap between detecting a leak and actually fixing it.

Satellites now detect methane super emitters within days, but only about 12 to 13% of UN alerts lead to any response. The detection problem is mostly solved. The follow up problem is not. This project is the follow up.

Goal: climate impact first, money second. Build it to be useful, open and credible.

## The person building it
Sharek is learning to build software with Claude Code. Act as a teacher as well as a builder:
- Explain what you are about to do in plain English before doing it.
- Keep each step small and runnable. Show him how to run it and what he should see.
- Prefer simple, readable code over clever code. No unnecessary frameworks.
- When there is a real choice to make, give him 2 options with a recommendation and let him pick.

## The core loop (the product)
For every alert:
1. **Ingest** a new plume / leak detection from a public data source.
2. **Attribute** it: what is the site, what sector (landfill, oil and gas, coal), who operates it.
3. **Find the responsible party**: operator, city, regulator, with contact routes.
4. **Draft the action**: a specific, plain language repair brief (what was seen, where, how big, likely causes for that site type, what to check first).
5. **Track closure**: watch later observations of the same source. Mark it fixed, persisting or recurring.
6. **Publish** a public scorecard of alerts vs. fixes.

The engine is leak type agnostic. Methane first, then oil slicks at sea, then industrial CO2.

## Data sources
### Methane (start here)
- **UNEP IMEO Eye on Methane**: https://methanedata.unep.org
  - Sources and plumes from the MARS alert system, downloadable as CSV / GeoJSON / JSON, plus an API.
  - Plume records include a `notified` field (whether an alert was sent), sector, country, satellite, lat/lon.
  - Licence: **CC BY-NC-SA 4.0, non commercial**. Fine for this project. Flag it if anything becomes commercial.
  - The website blocks scripts (Cloudflare). We use UNEP-IMEO's own copy on Hugging Face instead:
    https://huggingface.co/datasets/UNEP-IMEO/MARS-S2L (same licence; `src/download_mars.py`).
    It is a research snapshot (images 2013 to 2024, last updated June 2025), Sentinel-2/Landsat only,
    and almost entirely Oil and Gas. It contains no Waste sector plumes.
- **Carbon Mapper**: https://carbonmapper.org/data
  - Methane and CO2 point source plumes from Tanager-1, EMIT and airborne surveys.
  - Organises data into `plumes` and `sources`. **This is the MVP's main data source** (`src/download_carbon_mapper.py`).
  - The plume catalogue is public: no account or token needed. Endpoints used:
    `https://api.carbonmapper.org/api/v1/catalog/plume-csv` and `.../sources-csv`,
    filtered with `sectors=6A` (IPCC solid waste) and `plume_gas=CH4`.
  - As of Nov 2026: 10,157 landfill plumes, 2,746 sources, 2016 to 2026, updated daily. Top countries: US, Brazil, India, Mexico.
  - `sources` gives `observation_date_count`, `detection_date_count` and `source_persistence` (detections / looks).
  - Sources are listed at two clustering radii (`_1000m_` and `_250m_` in `source_name`), so the same site appears twice. Use one radius.
  - Terms: https://carbonmapper.org/terms. Cite Carbon Mapper. Commercial use or redistribution needs their permission:
    Sharek knows the Carbon Mapper team; they have said this non-profit use is fine (Nov 2026).
    Getting that in writing (an email) before the scorecard goes public is worth doing.

### Later
- **SkyTruth Cerulean** (oil slicks at sea): free OGC API at api.cerulean.skytruth.org. Already attributes slicks to likely vessels / platforms; SkyTruth does not do response, so the gap is the same.
- **Carbon Mapper CO2 plumes**: same API as above.

### Out of scope for now
- Water pipe leaks (ASTERRA already owns detection to field action).
- Refrigerant / HFC leaks (no satellite data; would need a different approach).

## MVP (version 1)
Narrow and finishable:
- Sector: **waste / landfills** (super emitters often come from cover cracks and gas collection valve failures, which are fixable; cities often lack capacity to act).
- Pull Carbon Mapper landfill (IPCC 6A) methane plumes and sources. (Eye on Methane's public data has no waste sector plumes.)
- Group plumes into sources, rank by emission rate and persistence.
- For the top 10 sources, generate a repair brief using the Claude API.
- Output a simple static web page: a table of sources, their status, and the brief for each.

Not in v1: sending emails to anyone, user accounts, payments, mobile app.

## Milestones
1. Set up the project (Python, virtual env, `.env` for API keys, git).
2. Download data and print a summary. **Done**: UNEP MARS (`src/summarize_plumes.py`, oil and gas only) and Carbon Mapper landfills (`src/summarize_landfills.py`).
3. Rank landfill sources. **Done** (`src/rank_sources.py`): 1000 m sources, 3+ looks, plume on 50%+ of looks,
   shortlist 30 by Carbon Mapper's figure, then rank by our own numbers computed from plume records
   (emissions summed per pass, then averaged across passes). Outputs `data/processed/top_sources.csv`
   and `data/processed/top_source_plumes.csv` (every plume behind the top 10, with a link to each record).
4. Write the repair brief generator (Claude API). Hand check 3 briefs for accuracy.
5. Closure tracking: for each source, compare latest vs. earlier observations.
6. Static scorecard page. **Started as a public layered map** (`docs/index.html`, built by `src/build_map_data.py`):
   Leaflet (our own copy in `docs/vendor/`), satellite base map (EOX Sentinel-2 cloudless, CC BY-NC-SA) or OpenStreetMap,
   layers for persistent landfill sites, top 10, latest plume images, and NASA GIBS carbon monoxide (AIRS),
   nitrogen dioxide (TROPOMI) and methane background (AIRS). Published with GitHub Pages from `docs/`.
   Still to add: site status (fixed / persisting / recurring) and repair briefs.
7. Add UNEP MARS as a second source (oil and gas; `notified` field shows the response gap).
8. Add Cerulean oil slicks as the second leak type.

## Ground rules
- Never invent data. Every number in a brief must trace back to a specific plume record. Include the plume ID and source link.
- Briefs describe likely causes as possibilities, not accusations.
- Credit data sources on every output, as their licences require.
- Keep API keys in `.env`, never commit them.
- Do not contact operators or regulators automatically. A human reviews and sends.

## Tech defaults
- Python 3, `requests`, `pandas`, `anthropic` SDK.
- Store data locally as files (CSV / SQLite) until there is a reason not to.
- Static HTML for the scorecard.

## Project layout
- `src/` — Python code.
- `data/raw/` — downloaded source files (not committed; re-download with the scripts).
- `.env` — API keys (not committed). Copy `.env.example` to start.
- `docs/` — the public map website (GitHub Pages). `docs/data/` and `docs/plumes/` are generated; rebuild with `src/build_map_data.py`.
