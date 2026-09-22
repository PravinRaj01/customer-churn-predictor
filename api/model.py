"""
Model loading with a hard startup contract check.

churn_model.pkl and model_columns.pkl are unregenerable artifacts — there
is no training script in this repo (see git history: they arrived
pre-built). If the pickle's column contract ever drifts from what
features.py builds, the API must refuse to start rather than silently
score misaligned vectors.
"""

import pickle
from pathlib import Path

from features import MODEL_COLUMNS

# Pickles live at the repo root, shared with legacy/streamlit_app.py. Check
# there first, but also check api/'s own directory as a fallback — some
# deploy hosts (Render with rootDir: api) clone the whole repo, but if a
# future host's "root directory" setting instead means "this is what gets
# uploaded", the pickles would land next to this file instead. Checking
# both means a mismatch there is a same-error ModelContractError/FileNotFound
# at a predictable startup step, not a mysterious runtime 500 later.
_API_DIR = Path(__file__).resolve().parent
_REPO_ROOT = _API_DIR.parent


def _first_existing(filename: str) -> Path:
    for candidate in (_REPO_ROOT / filename, _API_DIR / filename):
        if candidate.exists():
            return candidate
    raise FileNotFoundError(
        f"{filename} not found in {_REPO_ROOT} or {_API_DIR}"
    )


class ModelContractError(RuntimeError):
    """Raised when the loaded pickle disagrees with features.py's contract."""


def load_model():
    with open(_first_existing("churn_model.pkl"), "rb") as f:
        model = pickle.load(f)
    with open(_first_existing("model_columns.pkl"), "rb") as f:
        columns = list(pickle.load(f))

    if columns != MODEL_COLUMNS:
        raise ModelContractError(
            f"model_columns.pkl {columns!r} does not match "
            f"features.MODEL_COLUMNS {MODEL_COLUMNS!r}"
        )

    feature_names_in = list(getattr(model, "feature_names_in_", MODEL_COLUMNS))
    if feature_names_in != MODEL_COLUMNS:
        raise ModelContractError(
            f"model.feature_names_in_ {feature_names_in!r} does not match "
            f"features.MODEL_COLUMNS {MODEL_COLUMNS!r}"
        )

    return model, columns
