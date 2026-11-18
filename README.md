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

- UNEP IMEO Eye on Methane (https://methanedata.unep.org), CC BY-NC-SA 4.0.
