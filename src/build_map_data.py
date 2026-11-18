"""Build the data files for the public map (docs/index.html).

Run it with:  python src/build_map_data.py
(Run src/download_carbon_mapper.py and src/rank_sources.py first.)

Writes:
- docs/data/sites.geojson     persistent landfill sites (one point each)
- docs/data/plumes.json       latest plume images for the top 10 sites
- docs/plumes/*.png           copies of those plume images

Data: Carbon Mapper (https://carbonmapper.org/data).
"""

import json
import math
from pathlib import Path

import pandas as pd
import requests

RAW = Path("data/raw/carbon_mapper")
PROCESSED = Path("data/processed")
DOCS = Path("docs")
API = "https://api.carbonmapper.org/api/v1/catalog/"

MIN_LOOKS = 3
MIN_PERSISTENCE = 0.5


def number(x):
    """Round a number for the map, or return None if it is missing (NaN)."""
    return None if x is None or math.isnan(x) else round(float(x), 1)


def site_features():
    """One GeoJSON point per persistent landfill site."""
    sources = pd.read_csv(RAW / "landfill_sources.csv")
    sources = sources[sources["source_name"].str.contains("_1000m_")]
    sources = sources[(sources["observation_date_count"] >= MIN_LOOKS)
                      & (sources["source_persistence"] >= MIN_PERSISTENCE)]

    top = pd.read_csv(PROCESSED / "top_sources.csv").set_index("source_name")

    features = []
    for _, s in sources.iterrows():
        props = {
            "name": s["source_name"],
            "place": s["place"] if isinstance(s["place"], str) else "",
            "region": s["region"] if isinstance(s["region"], str) else "",
            "country": s["country"],
            "looks": int(s["observation_date_count"]),
            "detections": int(s["detection_date_count"]),
            "cm_emission_kg_h": number(s["source_emission"]),
            "records_link": API + "source-plumes-csv/" + s["source_name"],
        }
        if s["source_name"] in top.index:
            t = top.loc[s["source_name"]]
            props.update({
                "rank": int(t["rank"]),
                "mean_emission_kg_h": number(t["mean_emission_kg_h"]),
                "first_seen": t["first_seen"],
                "last_seen": t["last_seen"],
                "latest_emission_kg_h": number(t["latest_emission_kg_h"]),
                "latest_date": t["latest_quantified_date"],
                "latest_pass_id": t["latest_pass_id"],
            })
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point",
                         "coordinates": [round(s["source_longitude"], 5),
                                         round(s["source_latitude"], 5)]},
            "properties": props,
        })
    return features


def latest_plume_images():
    """Download the plume images from each top-10 site's latest pass.

    Carbon Mapper's image links expire, so we keep our own copies.
    """
    top = pd.read_csv(PROCESSED / "top_sources.csv")
    plumes = pd.read_csv(PROCESSED / "top_source_plumes.csv")
    out = []
    for _, t in top.iterrows():
        on_pass = plumes[plumes["plume_id"].str.startswith(t["latest_pass_id"] + "-")]
        for _, p in on_pass.iterrows():
            # Ask the API for a fresh copy of this plume's record (with a working image link).
            record = requests.get(API + "plumes/annotated",
                                  params={"plume_names": p["plume_id"]}, timeout=60).json()
            item = record["items"][0]
            west, south, east, north = json.loads(p["plume_bounds"])
            image = requests.get(item["plume_png"], timeout=60)
            image.raise_for_status()
            filename = f"plumes/{p['plume_id']}.png"
            (DOCS / filename).write_bytes(image.content)
            emission = p["emission_auto"]
            out.append({
                "plume_id": p["plume_id"],
                "source_name": t["source_name"],
                "date": p["datetime"][:10],
                "emission_kg_h": number(emission),
                "bounds": [[south, west], [north, east]],
                "image": filename,
                "record_link": API + "plumes/annotated?plume_names=" + p["plume_id"],
            })
            print(f"  saved {filename}")
    return out


if __name__ == "__main__":
    (DOCS / "data").mkdir(parents=True, exist_ok=True)
    (DOCS / "plumes").mkdir(parents=True, exist_ok=True)

    features = site_features()
    with open(DOCS / "data/sites.geojson", "w") as f:
        json.dump({"type": "FeatureCollection", "features": features}, f, allow_nan=False)
    print(f"Wrote {len(features)} sites to docs/data/sites.geojson")

    print("Downloading latest plume images for the top 10 sites...")
    images = latest_plume_images()
    with open(DOCS / "data/plumes.json", "w") as f:
        json.dump(images, f, indent=1, allow_nan=False)
    print(f"Wrote {len(images)} plume images to docs/data/plumes.json")
