from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sklearn.linear_model import LinearRegression
from pathlib import Path
import pandas as pd
import numpy as np
from datetime import datetime
from io import BytesIO

# ---------------- App Setup ---------------- #
app = FastAPI(title="ChargeSense AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Paths ---------------- #
DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)
MARKETING_FILE = DATA_DIR / "marketing_analytics_ready.xlsx"

# ---------------- Helpers ---------------- #
def safe_number(x):
    """Convert to float, handling empty or special strings."""
    try:
        if pd.isna(x):
            return 0.0
        if isinstance(x, str):
            x = x.replace("£", "").strip()
            if x.lower() in ["bus", ""]:
                return 0.0
        return float(x)
    except:
        return 0.0

def is_bus(x):
    """Check if the booking represents a bus."""
    if isinstance(x, str) and "bus" in x.lower():
        return 1
    try:
        return 1 if float(x) > 0 else 0
    except:
        return 0

def parse_week_from_filename(filename: str):
    """Return filename as placeholder week_start."""
    return filename

def load_marketing_data():
    if MARKETING_FILE.exists():
        df = pd.read_excel(MARKETING_FILE)
        df.columns = [str(c).strip().lower() for c in df.columns]
        return df
    return pd.DataFrame()

def compute_roas(df):
    """Compute ROAS for search, social, email spend."""
    for col in ["search_spend", "social_spend", "email_spend", "revenue"]:
        if col not in df.columns:
            df[col] = 0.0

    if len(df) < 2 or df["revenue"].sum() == 0:
        return 0.0, 0.0, 0.0

    model = LinearRegression().fit(
        df[["search_spend", "social_spend", "email_spend"]],
        df["revenue"]
    )
    return tuple(map(float, model.coef_))

# ---------------- Routes ---------------- #
@app.get("/")
async def root():
    return {"status": "ChargeSense AI backend running"}

# ---------------- Upload Endpoint ---------------- #
@app.post("/upload-weekly")
async def upload_weekly(file: UploadFile = File(...)):
    if not file.filename.endswith((".xlsx", ".xls", ".csv")):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Upload CSV or Excel."
        )

    # Read file into memory
    try:
        file_bytes = await file.read()
        if file.filename.endswith(".csv"):
            df_sheets = pd.read_csv(BytesIO(file_bytes))
            sheets = {"Mon": df_sheets}  # fallback for CSV
        else:
            xls = pd.ExcelFile(BytesIO(file_bytes))
            sheets = {sheet_name.strip(): xls.parse(sheet_name) for sheet_name in xls.sheet_names}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {e}")

    # ---------------- MARKETING ANALYTICS ---------------- #
    marketing_analytics = None
    marketing_sheet_candidates = [s for s in sheets if s.lower().startswith("marketing")]

    if marketing_sheet_candidates:
        sheet_name = marketing_sheet_candidates[0]
        df = sheets[sheet_name].copy()
        df.columns = [str(c).strip().lower() for c in df.columns]

        for col in ["revenue", "total_bookings", "search_spend", "social_spend", "email_spend"]:
            if col not in df.columns:
                df[col] = 0.0
            df[col] = df[col].map(safe_number)

        roas_search, roas_social, roas_email = compute_roas(df)
        df["roas_search"] = roas_search
        df["roas_social"] = roas_social
        df["roas_email"] = roas_email
        df["uploaded_at"] = datetime.utcnow().isoformat()

        # Save to file for persistence
        existing = load_marketing_data()
        final_df = pd.concat([existing, df], ignore_index=True) if not existing.empty else df
        final_df.to_excel(MARKETING_FILE, index=False)

        forecast = 0.0
        if df["revenue"].sum() > 0:
            model = LinearRegression().fit(
                df[["search_spend", "social_spend", "email_spend"]],
                df["revenue"]
            )
            forecast = model.predict(
                [[df["search_spend"].mean(), df["social_spend"].mean(), df["email_spend"].mean()]]
            )[0]

        marketing_analytics = {
            "weeks_data": df.round(1).to_dict("records"),
            "channel_roas": {"search": roas_search, "social": roas_social, "email": roas_email},
            "total_revenue_forecast": float(forecast)
        }

    # ---------------- WEEKLY BOOKINGS ---------------- #
    day_aliases = ["mon", "monday", "tue", "tuesday", "wed", "wednesday", "thu", "thursday", "fri", "friday"]
    has_day_sheets = any(name.lower() in day_aliases for name in sheets)

    customer_segments = []
    weekly_charges = []
    bus_usage = []
    week_start = None

    if has_day_sheets:
        week_start = parse_week_from_filename(file.filename)
        required_days = {
            "Mon": ["mon", "monday"],
            "Tue": ["tue", "tuesday"],
            "Wed": ["wed", "wednesday"],
            "Thu": ["thu", "thursday"],
            "Fri": ["fri", "friday"]
        }

        day_sheets = {}
        for day, aliases in required_days.items():
            for name in sheets:
                if name.lower() in aliases:
                    day_sheets[day] = sheets[name]
                    break
            if day not in day_sheets:
                raise HTTPException(status_code=400, detail=f"Missing {day} sheet")

        sessions = ["AM", "Explorers 1", "Explorers 2", "Explorers 3"]

        for day, df_day in day_sheets.items():
            df_day = df_day.copy()
            df_day.columns = [str(c).strip() for c in df_day.columns]

            charge_col = next((c for c in df_day.columns if c.lower() == "charge"), None)
            if not charge_col:
                raise HTTPException(status_code=400, detail="Missing required column: 'Charge'")

            for col in sessions:
                if col not in df_day.columns:
                    df_day[col] = 0
                df_day[col] = df_day[col].map(safe_number)

            df_day["segment"] = (
                df_day.get("Forename", "").astype(str).str.strip() + " " +
                df_day.get("Surname", "").astype(str).str.strip()
            ).str.strip()
            df_day = df_day[df_day["segment"] != ""]

            df_day["bookingCount"] = df_day[sessions].gt(0).sum(axis=1)
            df_day["totalCharge"] = df_day[charge_col].map(safe_number)

            for _, row in df_day.iterrows():
                customer_segments.append({
                    "segment": row["segment"],
                    "day": day,
                    "bookingCount": int(row["bookingCount"]),
                    "totalCharge": float(row["totalCharge"])
                })

            weekly_charges.append({
                "day": day,
                "totalCharge": float(df_day["totalCharge"].sum())
            })

            for s in sessions:
                bus_usage.append({
                    "busService": f"{day} {s}",
                    "usage": int(df_day[s].map(is_bus).sum())
                })

    # ---------------- RESPONSE ---------------- #
    return {
        "customerSegments": customer_segments,
        "weeklyCharges": weekly_charges,
        "busUsage": bus_usage,
        "marketingAnalytics": marketing_analytics,
        "week_start": week_start,
        "message": "Upload processed successfully"
    }
