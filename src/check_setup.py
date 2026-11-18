"""Milestone 1: check that the project is set up correctly.

Run it with:  python src/check_setup.py
"""

import os
import sys

print(f"Python version: {sys.version.split()[0]}")

# 1. Can we import every library the project needs?
missing = []
for name in ["requests", "pandas", "anthropic", "dotenv"]:
    try:
        __import__(name)
        print(f"  ok   {name}")
    except ImportError:
        print(f"  MISSING  {name}")
        missing.append(name)

if missing:
    print("\nSome libraries are missing. Run:  pip install -r requirements.txt")
    sys.exit(1)

# 2. Can we read the .env file? (We only say whether a key is set, never print it.)
from dotenv import load_dotenv

found_env_file = load_dotenv()
print(f"\n.env file found: {found_env_file}")

for key in ["ANTHROPIC_API_KEY", "CARBON_MAPPER_TOKEN"]:
    status = "set" if os.getenv(key) else "not set yet"
    print(f"  {key}: {status}")

print("\nSetup looks good.")
