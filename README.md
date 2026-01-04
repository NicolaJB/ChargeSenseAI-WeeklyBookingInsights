# ChargeSense AI

**Weekly Booking and Marketing Insights Generator**

ChargeSense AI is a full-stack web application for analysing and visualising school booking charge data and marketing performance. It transforms raw operational spreadsheets into interactive dashboards with charts, tables, and basic forecasts.

This project demonstrates end-to-end data engineering and applied analytics using modern Python and React tooling, showcasing skills in supervised machine learning, regression-based media mix modelling, and time-series forecasting.

## Tech Stack

**Frontend**  
* React  
* TypeScript  
* Next.js 14  
* Chart.js  

**Backend**  
* FastAPI (Python)  
* pandas, NumPy  
* scikit-learn (Linear Regression)  

**Infrastructure**  
* REST API over HTTP  
* Local file persistence for uploaded analytics data

## Core Features

### Booking and Charge Analytics
* Upload Excel (.xlsx, .xls) or CSV files containing weekly bookings.  
* Aggregate bookings across weekdays (Monday–Friday) and compute:
  * Total charges per student  
  * Booking counts per student  
  * Daily total charges  
  * Bus usage by day and session  
* Display results via interactive charts and tables.

### Marketing Analytics (Optional Sheet)
* Detect and process a sheet named **Marketing**.  
* Aggregate weekly spend and revenue data.  
* Estimate channel-level **ROAS** using supervised linear regression.  
* Forecast total weekly revenue based on marketing spend.  
* Visualise:
  * **Media Mix Contribution to Revenue** (stacked bar chart by channel)  
  * **Regression-based attribution** (percentage contribution of each channel)  
  * **Time-series revenue forecasting** (historical versus predicted revenue trends)  
  
## Visual Outputs
* Weekly charges: actual versus predicted  
* Marketing impact: spend versus revenue, channel contributions, regression-based attribution  
* Top students by total spend  
* Bus usage by service and day  
* Summary metrics for marketing performance  

## Expected File Formats

**Booking Data Columns**  
```css
Forename, Surname, Charge, AM, Explorers 1, Explorers 2, Explorers 3
```
**Marketing Data Columns**  
```css
week, week_start, revenue, total_bookings, search_spend, social_spend, email_spend
```
> Uploading a marketing sheet alone will still generate analytics.

## Analytics and Modelling Summary

The backend mirrors core media mix modelling concepts. It uses supervised machine learning and regression-based modelling to generate interpretable forecasts and channel contribution estimates.

| Technique | Status | Notes |
|-----------|--------|-------|
| Media Mix Modelling (MMM) | Simplified | Weekly revenue explained jointly by search, social, and email spend via linear regression. |
| Attribution Modelling | Proxy | Regression-based channel contribution estimates; not causal or multi-touch. |
| Time Series | Basic | Weekly revenue and bookings treated as time series for forecasting. |
| Machine Learning | Simplified | Supervised ML via scikit-learn for regression and forecasting. |

## Project Structure
```bash
ChargeSenseAI/
├─ chargesenseai-backend/ # FastAPI backend
│ ├─ app/
│ │ └─ main.py
│ └─ requirements.txt
├─ chargesenseai-frontend/ # Next.js frontend
│ ├─ app/
│ │ ├─ page.tsx
│ │ ├─ layout.tsx
│ │ └─ upload/
│ │ └─ page.tsx
│ ├─ components/
│ │ ├─ Dashboard.tsx
│ │ ├─ DashboardPage.tsx
│ │ ├─ Navigation.tsx
│ │ ├─ UploadForm.tsx
│ │ └─ Toast.tsx
├─ package.json
└─ README.md
```

## Prerequisites

* Node.js 18+  
* Python 3.10+  
* Required Python packages:
  * fastapi  
  * uvicorn  
  * pandas  
  * numpy  
  * scikit-learn  
  * openpyxl  

**Recommended editor:** VS Code or PyCharm  

## Backend Setup

```bash
cd chargesenseai-backend
python3.10 -m venv venv
source venv/bin/activate   # macOS/Linux
venv\Scripts\activate      # Windows

pip install -r requirements.txt
uvicorn app.main:app --reload --port 51115
```
Health check: http://127.0.0.1:51115

Expected response:
```
{"status": "ChargeSense AI backend running"}
```
## Frontend Setup
```bash
cd chargesenseai-frontend
npm install
npm run dev
```
Open: http://localhost:3000

## Usage

Open the web app in your browser. Upload an Excel or CSV file containing:
- Daily booking sheets (Monday–Friday), file name e.g. 'weekly-bookings-08-12-2025.xlsx'

and/or
- A sheet named for marketing analytics, file name e.g. 'marketing_analytics_ready.xlsx'

View results instantly in the dashboard with:

- Charts
- Tables
- Summary metrics

### Potential Advancements
- Improved forecasting models (ARIMA, Bayesian MMM)
- Explicit schema validation for uploads
- Database persistence and multi-school support
- Deployment to Azure or AWS
- Formal incrementality testing and multi-touch attribution

## License
MIT License