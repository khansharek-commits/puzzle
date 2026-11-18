"""Milestone 2a: download UNEP IMEO's MARS-S2L plume data from Hugging Face.

Why Hugging Face and not methanedata.unep.org?
The Eye on Methane website blocks scripts (Cloudflare check). UNEP-IMEO
publishes this dataset on Hugging Face themselves, under the same licence.

Data: UNEP IMEO, MARS-S2L dataset, https://huggingface.co/datasets/UNEP-IMEO/MARS-S2L
Licence: CC BY-NC-SA 4.0 (non commercial, share alike, credit required).

Run it with:  python src/download_mars.py
"""

from pathlib import Path

import requests

BASE_URL = "https://huggingface.co/datasets/UNEP-IMEO/MARS-S2L/resolve/main/"
OUT_DIR = Path("data/raw/mars_s2l")

FILES = [
    "validated_images_plumes.csv",  # one row per plume: id, date, emission rate
    "validated_images_all.csv",     # one row per image: sector, country, notified
    "last_time_updated.json",       # when UNEP last updated the dataset
]


def download(name):
    url = BASE_URL + name
    path = OUT_DIR / name
    print(f"Downloading {name} ...")
    response = requests.get(url, timeout=300)
    response.raise_for_status()  # stop with an error if the download failed
    path.write_bytes(response.content)
    print(f"  saved {path} ({len(response.content) / 1_000_000:.1f} MB)")


if __name__ == "__main__":
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for name in FILES:
        download(name)
    print("Done.")
