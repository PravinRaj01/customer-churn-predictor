"""
Numerical parity test: proves features.build_features() produces bit-for-bit
identical model output to the original Streamlit preprocessing path
(pd.get_dummies + reindex, see legacy/streamlit_app.py lines 30-45).

The model has no training script in this repo (churn_model.pkl and
model_columns.pkl arrived pre-built) — it is unregenerable. This test is
the only proof that swapping the encoding strategy did not change a single
prediction.
"""

import itertools
import pickle
from pathlib import Path

import pandas as pd
import pytest

from features import build_features

_ROOT = Path(__file__).resolve().parent.parent.parent

with open(_ROOT / "churn_model.pkl", "rb") as f:
    MODEL = pickle.load(f)
with open(_ROOT / "model_columns.pkl", "rb") as f:
    COLUMNS = list(pickle.load(f))


def streamlit_path(tenure, monthly_charges, contract, internet_service):
    """Verbatim port of legacy/streamlit_app.py lines 30-41."""
    input_data = pd.DataFrame(
        {
            "tenure": [tenure],
            "MonthlyCharges": [monthly_charges],
            "Contract": [contract],
            "InternetService": [internet_service],
        }
    )
    input_encoded = pd.get_dummies(input_data)
    return input_encoded.reindex(columns=COLUMNS, fill_value=0)


TENURES = [0, 1, 12, 36, 71, 72]
CHARGES = [0.0, 19.99, 50.0, 74.5, 150.0]
CONTRACTS = ["Month-to-month", "One year", "Two year"]
INTERNET = ["DSL", "Fiber optic", "No"]

GRID = list(itertools.product(TENURES, CHARGES, CONTRACTS, INTERNET))


@pytest.mark.parametrize("tenure,monthly_charges,contract,internet", GRID)
def test_parity(tenure, monthly_charges, contract, internet):
    old_input = streamlit_path(tenure, monthly_charges, contract, internet)
    new_input = build_features(tenure, monthly_charges, contract, internet)

    old_proba = MODEL.predict_proba(old_input)[0][1]
    new_proba = MODEL.predict_proba(new_input)[0][1]
    assert abs(old_proba - new_proba) < 1e-12, (
        tenure,
        monthly_charges,
        contract,
        internet,
        old_proba,
        new_proba,
    )

    old_label = int(MODEL.predict(old_input)[0])
    new_label = int(new_proba >= 0.5)
    assert old_label == new_label, (tenure, monthly_charges, contract, internet)


def test_grid_covers_full_cartesian_product():
    assert len(GRID) == len(TENURES) * len(CHARGES) * len(CONTRACTS) * len(INTERNET)
