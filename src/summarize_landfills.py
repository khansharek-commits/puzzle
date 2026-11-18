"""Print a summary of Carbon Mapper landfill methane data.

Run it with:  python src/summarize_landfills.py
(Run src/download_carbon_mapper.py first.)

Data: Carbon Mapper (https://carbonmapper.org/data).
"""

import pandas as pd

DATA_DIR = "data/raw/carbon_mapper/"

plumes = pd.read_csv(DATA_DIR + "landfill_plumes.csv")
sources = pd.read_csv(DATA_DIR + "landfill_sources.csv")
dates = pd.to_datetime(plumes["datetime"], format="mixed", utc=True)

print(f"Landfill plumes:  {len(plumes):,}")
print(f"Landfill sources: {len(sources):,}")
print(f"Dates: {dates.min():%Y-%m-%d} to {dates.max():%Y-%m-%d}")

print("\nPlumes by country (top 15):")
print(plumes["country"].value_counts().head(15).to_string())

print("\nPlumes by instrument:")
print(plumes["instrument"].value_counts().to_string())

print("\nSources seen leaking on at least half of looks, and looked at 3+ times:")
persistent = sources[(sources["source_persistence"] >= 0.5)
                     & (sources["observation_date_count"] >= 3)]
print(f"  {len(persistent):,} of {len(sources):,} sources")

print("\nTop 10 sources by emission rate (kg/h), among those persistent sources:")
top = persistent.sort_values("source_emission", ascending=False).head(10)
cols = ["source_name", "country", "place", "source_emission",
        "observation_date_count", "detection_date_count", "source_persistence"]
print(top[cols].round(2).to_string(index=False))

print("\nData: Carbon Mapper (carbonmapper.org)")
