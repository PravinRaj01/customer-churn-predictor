"""
FastAPI backend for the Butter Churn predictor.

Decoupled replacement for legacy/streamlit_app.py's inline predict-on-click
logic. The model is loaded once at startup (the FastAPI equivalent of
Streamlit's @st.cache_resource) and validated against the column contract
in features.py before the app is allowed to serve traffic.
"""

from contextlib import asynccontextmanager

import sklearn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from features import build_features
from model import load_model
from schemas import (
    HealthResponse,
    ModelInfo,
    PredictRequest,
    PredictResponse,
    risk_band_for,
)

state: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    model, columns = load_model()
    state["model"] = model
    state["columns"] = columns
    state["sklearn_version"] = sklearn.__version__
    yield
    state.clear()


app = FastAPI(title="Butter Churn API", lifespan=lifespan)

# In production the browser only talks to the Next.js server (which proxies
# to this API), so no cross-origin request ever occurs. This origin is for
# local development only, where the frontend runs on a different port.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        model_loaded="model" in state,
        columns=state.get("columns", []),
        sklearn_version=state.get("sklearn_version", "unknown"),
    )


@app.post("/api/predict", response_model=PredictResponse)
async def predict(payload: PredictRequest) -> PredictResponse:
    model = state["model"]

    try:
        features = build_features(
            tenure=payload.tenure,
            monthly_charges=payload.monthly_charges,
            contract=payload.contract,
            internet_service=payload.internet_service,
        )
    except KeyError as exc:
        # Defense in depth: Literal[...] on PredictRequest already rejects
        # unknown categories with a 422 before we get here.
        raise HTTPException(status_code=422, detail=f"Unknown category: {exc}")

    churn_probability = float(model.predict_proba(features)[0][1])
    prediction = int(churn_probability >= 0.5)

    return PredictResponse(
        prediction=prediction,
        churn_probability=churn_probability,
        retention_probability=1.0 - churn_probability,
        risk_band=risk_band_for(churn_probability),
        model=ModelInfo(type=type(model).__name__, sklearn=state["sklearn_version"]),
    )
