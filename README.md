# Leak to Fix

Satellites spot methane super emitters within days, but most alerts never lead to a repair.
This project is the follow-up: it turns public leak detections into plain-language repair
briefs and tracks whether each leak gets fixed.

See `CLAUDE.md` for the full plan and milestones.

## Setup

```bash
python3 -m venv .venv            # create a private Python for this project
source .venv/bin/activate        # switch to it (Windows: .venv\Scripts\activate)
pip install -r requirements.txt  # install the libraries
cp .env.example .env             # then open .env and paste in your keys
python src/check_setup.py        # confirm everything works
```

## Data credits

- Carbon Mapper (https://carbonmapper.org/data). See https://carbonmapper.org/terms.

- UNEP IMEO Eye on Methane (https://methanedata.unep.org) and the UNEP IMEO MARS-S2L dataset
  (https://huggingface.co/datasets/UNEP-IMEO/MARS-S2L), CC BY-NC-SA 4.0.

## Milestone 2: get and summarise the data

```bash
python src/download_mars.py      # downloads ~100 MB into data/raw/mars_s2l/
python src/summarize_plumes.py   # plume counts by sector and country
python src/download_carbon_mapper.py  # landfill plumes and sources (~13 MB)
python src/summarize_landfills.py     # landfill summary and top sources
```

## Milestone 3: rank landfill sources

```bash
python src/rank_sources.py   # top 10 landfill sources -> data/processed/
```
