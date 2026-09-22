"""
Feature engineering for the churn model.

This is a direct-vector replacement for the Streamlit app's
`pd.get_dummies(...).reindex(columns=model_columns, fill_value=0)` pattern
(see legacy/streamlit_app.py). Building the 8-column vector explicitly
(rather than one-hot-encoding raw strings and reindexing) means an
invalid category raises a KeyError instead of silently producing an
all-zero one-hot block that the model would happily score.

MODEL_COLUMNS is the immutable contract baked into churn_model.pkl via
its `feature_names_in_` attribute. The model has no training script in
this repo, so this list must never be reordered or renamed without also
verifying it against the pickle (see model.py's startup check).
"""

import pandas as pd

MODEL_COLUMNS = [
    "tenure",
    "MonthlyCharges",
    "Contract_Month-to-month",
    "Contract_One year",
    "Contract_Two year",
    "InternetService_DSL",
    "InternetService_Fiber optic",
    "InternetService_No",
]

CONTRACT_COLUMN = {
    "Month-to-month": "Contract_Month-to-month",
    "One year": "Contract_One year",
    "Two year": "Contract_Two year",
}

INTERNET_COLUMN = {
    "DSL": "InternetService_DSL",
    "Fiber optic": "InternetService_Fiber optic",
    "No": "InternetService_No",
}


def build_features(
    tenure: int,
    monthly_charges: float,
    contract: str,
    internet_service: str,
) -> pd.DataFrame:
    """Build the single-row feature DataFrame the model expects.

    Returns a DataFrame (not a bare ndarray) with columns named and
    ordered exactly as MODEL_COLUMNS, because the model carries
    `feature_names_in_` — passing an ndarray or a differently-ordered
    frame either warns or silently misaligns the columns.

    Raises KeyError if `contract` or `internet_service` is not one of
    the known categories (surfaced as a 422 by the API layer).
    """
    row = dict.fromkeys(MODEL_COLUMNS, 0.0)
    row["tenure"] = float(tenure)
    row["MonthlyCharges"] = float(monthly_charges)
    row[CONTRACT_COLUMN[contract]] = 1.0
    row[INTERNET_COLUMN[internet_service]] = 1.0

    return pd.DataFrame(
        [[row[col] for col in MODEL_COLUMNS]],
        columns=MODEL_COLUMNS,
        dtype="float64",
    )
