# AetherShield: Space Weather & GNSS Observatory

AetherShield is a full-stack space weather monitoring and GNSS (Global Navigation Satellite System) data analysis platform. It provides public visitors with live space environment metrics and provides researchers with an interactive scientific cockpit to monitor regional Total Electron Content (TEC) disturbances, track visible satellite orbits, manage GNSS observatory receiver arrays, and ingest standard RINEX logs.

---

## Features

- **Public Landing Page**: Premium dark-themed, glassmorphic UI displaying live space weather summaries (Kp Index, Solar Wind, Radio Flux) and NOAA scale warnings.
- **Role-Based Authentication**: Secure authentication checks for two user roles:
  - **Scientists/Researchers**: View detailed telemetry, inspect orbital sky plots, filter TEC history graphs, and upload RINEX observation logs.
  - **Administrators**: Full access + permissions to register and configure new regional GNSS tracking stations.
- **Dynamic Satellite Sky Plot**: A circular polar coordinate radar plotting the real-time azimuth and elevation of GPS (Blue), GLONASS (Red), Galileo (Green), and BeiDou (Yellow) satellites, complete with signal-to-noise ratio histograms.
- **TEC Trend Visualizations**: Multi-station historical line charts tracking diurnal electron concentration (TECU) variations using Chart.js.
- **Data Ingestion Terminal**: Drag-and-drop RINEX observation upload. The backend parses standard RINEX header definitions (`MARKER NAME`, `REC # / TYPE / VERS`, `ANT # / TYPE`, `APPROX POSITION XYZ`) in real-time, streaming execution logs to a simulated frontend terminal.
- **Database Resilience**: Connects dynamically to MongoDB with an automatic in-memory mock fallback, ensuring the platform runs out-of-the-box on any system configuration.

---

## Installation & Setup

### Prerequisites
- Python 3.8 or higher.
- MongoDB (optional, the platform runs in mock-memory mode if offline).

### 1. Install Dependencies
Navigate to the root directory and install dependencies:
```bash
pip install -r requirements.txt
```

### 2. Launch the Application Server
Run the FastAPI application with Uvicorn:
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
*The database will be automatically seeded with default credentials and historical datasets upon startup.*

### 3. Open in Browser
Visit the platform in your web browser:
- **Observatory Portal**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **API Documentation (Swagger UI)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## Default Accounts

To access the interactive cockpit dashboard, click **Enter Observatory** on the landing page and use these pre-seeded developer credentials:

| Role | Username | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | Full access, station registration, data uploads |
| **Scientist** | `scientist` | `scientist123` | View charts, track orbits, upload files |

---

## Directory Structure

```text
ist/
├── backend/
│   ├── main.py          # FastAPI application routes and upload handling
│   ├── database.py      # MongoDB connections & SQLite/Mock fallback
│   ├── models.py        # Pydantic schemas for data validation
│   └── seed_data.py     # Initial mock dataset seeds
├── frontend/
│   ├── index.html       # Landing page structure & metadata
│   ├── style.css        # Premium custom CSS styling
│   └── app.js           # Chart rendering, sky plot trig, and upload logs
├── requirements.txt     # Python requirements
└── README.md            # This documentation file
```
