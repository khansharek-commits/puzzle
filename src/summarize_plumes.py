"""Milestone 2b: load the MARS plume data and print a summary.

Run it with:  python src/summarize_plumes.py
(Run src/download_mars.py first.)

Data: UNEP IMEO, MARS-S2L dataset, https://huggingface.co/datasets/UNEP-IMEO/MARS-S2L
Licence: CC BY-NC-SA 4.0.
"""

import pandas as pd

DATA_DIR = "data/raw/mars_s2l/"


def load_plumes():
    """Return one row per plume, with sector, country and notified attached."""
    plumes = pd.read_csv(DATA_DIR + "validated_images_plumes.csv")

    # The plume file has no sector or country. Those live in the image file,
    # so we look them up by the image ID that both files share.
    images = pd.read_csv(
        DATA_DIR + "validated_images_all.csv",
        usecols=["id_loc_image", "id_location", "location_name",
                 "sector", "country", "notified", "offshore"],
    )
    return plumes.merge(images, on="id_loc_image", how="left")


if __name__ == "__main__":
    plumes = load_plumes()
    dates = pd.to_datetime(plumes["tile_date"], format="mixed", utc=True)

    print(f"Plumes: {len(plumes):,}")
    print(f"Dates:  {dates.min():%Y-%m-%d} to {dates.max():%Y-%m-%d}")
    print(f"Sites:  {plumes['id_location'].nunique():,}")

    print("\nPlumes by sector:")
    print(plumes["sector"].value_counts(dropna=False).to_string())

    print("\nTop 15 countries:")
    print(plumes["country"].value_counts().head(15).to_string())

    print("\nShare of plumes that UNEP notified, by sector:")
    notified = plumes.groupby("sector")["notified"].mean().mul(100).round(1)
    print(notified.astype(str).add(" %").to_string())

    print("\nWaste sector, plumes by country:")
    waste = plumes[plumes["sector"] == "Waste"]
    print(waste["country"].value_counts().to_string())

    print("\nData: UNEP IMEO MARS-S2L (CC BY-NC-SA 4.0)")
