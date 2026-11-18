"""Download landfill (solid waste) methane plumes and sources from Carbon Mapper.

The plume catalogue is public, so no account or token is needed.

Data: Carbon Mapper, https://carbonmapper.org/data
Terms: https://carbonmapper.org/terms - cite Carbon Mapper as the data provider.
Commercial use or redistribution needs their permission.

Run it with:  python src/download_carbon_mapper.py
"""

from pathlib import Path

import requests

API = "https://api.carbonmapper.org/api/v1/catalog/"
OUT_DIR = Path("data/raw/carbon_mapper")

# IPCC sector 6A = solid waste disposal (landfills, dumps). Methane only.
FILTERS = {"sectors": "6A", "plume_gas": "CH4"}

FILES = {
    "plume-csv": "landfill_plumes.csv",     # one row per plume detection
    "sources-csv": "landfill_sources.csv",  # plumes grouped into sites
}


def download(endpoint, filename):
    print(f"Downloading {endpoint} ...")
    response = requests.get(API + endpoint, params=FILTERS, timeout=300)
    response.raise_for_status()  # stop with an error if the download failed
    path = OUT_DIR / filename
    path.write_bytes(response.content)
    print(f"  saved {path} ({len(response.content) / 1_000_000:.1f} MB)")


if __name__ == "__main__":
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for endpoint, filename in FILES.items():
        download(endpoint, filename)
    print("Done.")
