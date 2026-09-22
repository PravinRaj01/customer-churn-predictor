"""Pydantic request/response models for the churn prediction API."""

from typing import Literal

from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    """Mirrors the four inputs from legacy/streamlit_app.py exactly,
    including their min/max ranges."""

    tenure: int = Field(ge=0, le=72, description="Months with company")
    monthly_charges: float = Field(ge=0, le=150, description="Monthly charges in USD")
    contract: Literal["Month-to-month", "One year", "Two year"]
    internet_service: Literal["DSL", "Fiber optic", "No"]


RiskBand = Literal["creamy", "steady", "curdling", "spoiled"]


def risk_band_for(churn_probability: float) -> RiskBand:
    if churn_probability < 0.25:
        return "creamy"
    if churn_probability < 0.5:
        return "steady"
    if churn_probability < 0.75:
        return "curdling"
    return "spoiled"


class ModelInfo(BaseModel):
    type: str
    sklearn: str


class PredictResponse(BaseModel):
    prediction: int
    churn_probability: float
    retention_probability: float
    risk_band: RiskBand
    threshold: float = 0.5
    model: ModelInfo


class HealthResponse(BaseModel):
    status: Literal["ok"]
    model_loaded: bool
    columns: list[str]
    sklearn_version: str
