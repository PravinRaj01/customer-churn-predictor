# Customer Churn Predictor

A web app where a business user enters a customer's profile (tenure, contract
type, monthly charges, internet service) and a pre-trained model predicts
whether that customer will cancel, along with a probability score.

**Live:** https://customer-butterchurn-predictor.vercel.app

## Stack

- **Frontend** (`web/`) — Next.js 15, React 19, TypeScript, Tailwind CSS v4,
  Motion (Framer Motion) for the animated "Butter Churn" interface
- **Backend** (`api/`) — FastAPI, scikit-learn 1.6.1, pandas, Pydantic v2
- **Deployed on** Vercel (frontend) + Render (API), both on free tiers

The frontend never talks to the API directly — a Next.js route proxies
requests, so the backend URL stays server-side only.

## The model

`churn_model.pkl` is a `GradientBoostingClassifier` (scikit-learn 1.6.1) that
takes 8 features: tenure, monthly charges, and one-hot encoded contract type
and internet service. **There is no training script in this repo** — the
model and `model_columns.pkl` arrived as pre-built artifacts. Because of
that, `api/model.py` checks the loaded model's expected columns against the
API's own encoding at startup and refuses to serve if they ever disagree.

`api/tests/test_parity.py` proves the API's request encoding produces
identical predictions to the original Streamlit app's logic (kept in
`legacy/`) across 271 input combinations.

## Running locally

**API** (needs Python 3.12 — scikit-learn 1.6.1 has no 3.13+/3.14 wheels):

```bash
cd api
uv venv --python 3.12
uv pip install -r requirements-dev.txt
uv run uvicorn main:app --reload --port 8000
```

**Frontend** (separate terminal):

```bash
cd web
npm install
echo "API_URL=http://localhost:8000" > .env.local
npm run dev
```

Then open http://localhost:3000.

**Run the tests:**

```bash
cd api && uv run pytest tests/ -q
```

## Structure

```
api/            FastAPI backend
web/            Next.js frontend
legacy/         The original Streamlit prototype (kept as a reference, not deployed)
render.yaml     Render deployment config
```

## Known limitations

- The free-tier API sleeps after 15 minutes of inactivity; the first request
  after that can take 30–60 seconds to wake up. The frontend pings it awake
  on page load and shows a "still waking" message if it's a genuine cold
  start.
- The model's training data isn't in this repo, so it can't be retrained or
  re-evaluated here — only served.
