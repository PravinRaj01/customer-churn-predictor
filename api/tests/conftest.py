import sys
from pathlib import Path

# Allow `from features import ...` / `from model import ...` when tests are
# run from anywhere, without needing api/ installed as a package.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
