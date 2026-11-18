"""Milestone 3: rank landfill methane sources and keep the plume records behind them.

Run it with:  python src/rank_sources.py
(Run src/download_carbon_mapper.py first.)

What it does:
1. Keep Carbon Mapper sources grouped at 1000 m (each source is listed at both
   250 m and 1000 m; 1000 m keeps a whole landfill together as one site).
2. Keep sources we have real evidence for: looked at 3+ times, and a plume
   seen on at least half of those looks.
3. Shortlist the 30 biggest by Carbon Mapper's own emission figure.
4. Download every plume record for each shortlisted source.
5. Work out our own numbers from those plume records, so every number traces
   back to plume IDs, and rank by them.

Outputs (in data/processed/):
- top_sources.csv        one row per ranked source
- top_source_plumes.csv  every plume record behind those sources

Data: Carbon Mapper (https://carbonmapper.org/data).
"""

from io import StringIO
from pathlib import Path

import pandas as pd
import requests

API = "https://api.carbonmapper.org/api/v1/catalog/"
RAW = Path("data/raw/carbon_mapper")
CACHE = RAW / "source_plumes"
OUT = Path("data/processed")

MIN_LOOKS = 3
MIN_PERSISTENCE = 0.5
SHORTLIST = 30
TOP_N = 10


def plume_link(plume_id):
    """A link anyone can open to see the original plume record."""
    return f"{API}plumes/annotated?plume_names={plume_id}"


def source_link(source_name):
    """A link to the full list of plume records for a source."""
    return f"{API}source-plumes-csv/{source_name}"


def get_source_plumes(source_name):
    """Download (or reuse a saved copy of) all plume records for one source."""
    path = CACHE / f"{source_name}.csv"
    if not path.exists():
        print(f"  downloading plumes for {source_name}")
        response = requests.get(source_link(source_name), timeout=120)
        response.raise_for_status()
        path.write_text(response.text)
    return pd.read_csv(path)


def summarise_source(plumes):
    """Turn one source's plume records into our own source-level numbers.

    One satellite or aircraft pass can show several plumes from the same
    landfill (plume IDs ending -A, -B, -C...). We add those together to get
    the total seen on that pass, then look across passes.
    """
    plumes = plumes.copy()
    plumes["pass_id"] = plumes["plume_id"].str.rsplit("-", n=1).str[0]
    plumes["date"] = plumes["datetime"].str[:10]

    # Total emission seen on each pass. min_count=1 means a pass where no
    # plume had an emission estimate stays blank instead of becoming 0.
    passes = plumes.groupby("pass_id").agg(
        date=("date", "first"),
        emission=("emission_auto", lambda s: s.sum(min_count=1)),
    ).sort_values("date")
    quantified = passes.dropna(subset=["emission"])
    latest = quantified.iloc[-1]

    return {
        "plume_count": len(plumes),
        "passes_with_plume": len(passes),
        "passes_quantified": len(quantified),
        "mean_emission_kg_h": quantified["emission"].mean(),
        "max_emission_kg_h": quantified["emission"].max(),
        "first_seen": passes["date"].min(),
        "last_seen": passes["date"].max(),
        "latest_quantified_date": latest["date"],
        "latest_emission_kg_h": latest["emission"],
        "latest_pass_id": latest.name,
    }


if __name__ == "__main__":
    CACHE.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)

    sources = pd.read_csv(RAW / "landfill_sources.csv")
    sources = sources[sources["source_name"].str.contains("_1000m_")]
    print(f"Sources at 1000 m: {len(sources):,}")

    sources = sources[(sources["observation_date_count"] >= MIN_LOOKS)
                      & (sources["source_persistence"] >= MIN_PERSISTENCE)]
    print(f"With {MIN_LOOKS}+ looks and plume on {MIN_PERSISTENCE:.0%}+ of them: {len(sources):,}")

    shortlist = sources.sort_values("source_emission", ascending=False).head(SHORTLIST)
    print(f"Shortlisted the {SHORTLIST} biggest. Fetching their plume records...")

    rows = []
    all_plumes = []
    for _, source in shortlist.iterrows():
        plumes = get_source_plumes(source["source_name"])
        plumes.insert(0, "source_name", source["source_name"])
        all_plumes.append(plumes)

        row = {
            "source_name": source["source_name"],
            "country": source["country"],
            "region": source["region"],
            "place": source["place"],
            "latitude": source["source_latitude"],
            "longitude": source["source_longitude"],
            # These three come straight from Carbon Mapper's source record.
            "cm_looks": source["observation_date_count"],
            "cm_detections": source["detection_date_count"],
            "cm_persistence": source["source_persistence"],
            "cm_source_emission_kg_h": source["source_emission"],
        }
        row.update(summarise_source(plumes))
        row["source_link"] = source_link(source["source_name"])
        rows.append(row)

    ranked = pd.DataFrame(rows).sort_values("mean_emission_kg_h", ascending=False)
    ranked.insert(0, "rank", range(1, len(ranked) + 1))
    top = ranked.head(TOP_N)

    plumes = pd.concat(all_plumes)
    plumes = plumes[plumes["source_name"].isin(top["source_name"])]
    plumes["plume_link"] = plumes["plume_id"].map(plume_link)

    top.to_csv(OUT / "top_sources.csv", index=False)
    plumes.to_csv(OUT / "top_source_plumes.csv", index=False)

    print(f"\nTop {TOP_N} landfill methane sources (emission in kg of methane per hour):\n")
    show = top[["rank", "country", "place", "mean_emission_kg_h", "cm_looks",
                "cm_detections", "first_seen", "last_seen", "latest_emission_kg_h"]]
    print(show.round(0).to_string(index=False))
    print(f"\nSaved {OUT / 'top_sources.csv'} and {OUT / 'top_source_plumes.csv'} "
          f"({len(plumes):,} plume records)")
    print("Data: Carbon Mapper (carbonmapper.org)")
