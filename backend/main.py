import os
import logging
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
import sys
from pathlib import Path

# Fix 'ModuleNotFoundError: No module named backend' when running directly
project_root = str(Path(__file__).parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from backend.database import get_database
from backend.seed_data import seed_database
from backend.auth import router as auth_router
from backend.weather import router as weather_router
from backend.stations import router as stations_router
from backend.satellites import router as satellites_router
from backend.uploads import router as uploads_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AetherShield.Main")

app = FastAPI(title="AetherShield Space Weather & GNSS Observatory API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(weather_router)
app.include_router(stations_router)
app.include_router(satellites_router)
app.include_router(uploads_router)

@app.on_event("startup")
async def startup_db_client():
    db, is_mongo = await get_database()
    await seed_database(db, is_mongo)

@app.get("/api/status")
async def get_status():
    db, is_mongo = await get_database()
    try:
        if is_mongo:
            await db.client.admin.command('ping')
            db_status = "Connected"
        else:
            db_status = "Connected (In-Memory Fallback)"
    except Exception:
        db_status = "Disconnected"
        
    return {
        "status": "operational",
        "database": db_status,
        "is_mongodb": is_mongo,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/seed")
async def seed_data():
    db, is_mongo = await get_database()
    await seed_database(db, is_mongo)
    return {"message": "Database seeded successfully with test records."}

BASE_DIR = Path(__file__).resolve().parent.parent
frontend_path = os.path.join(BASE_DIR, "frontend")

@app.get("/")
async def read_index():
    index_file = os.path.join(frontend_path, "dist", "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return HTMLResponse(content="<h1>AetherShield</h1><p>Vite build not found. Please run npm run build.</p>")

@app.get("/favicon.svg")
async def get_favicon():
    fav = os.path.join(frontend_path, "dist", "favicon.svg")
    if os.path.exists(fav):
        return FileResponse(fav)
    return HTMLResponse(status_code=404)


# Only mount static assets directory if it actually exists (avoids startup crash)
assets_dir = os.path.join(frontend_path, "dist", "assets")
if os.path.isdir(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

if __name__ == "__main__":
    # Suppress all logs when running directly via python main.py (inherits to reloader process)
    os.environ["SUPPRESS_LOGS"] = "1"
    # Also suppress for the parent process just in case
    logging.getLogger("AetherShield").setLevel(logging.CRITICAL)
    logging.getLogger("AetherShield.Database").setLevel(logging.CRITICAL)
    logging.getLogger("AetherShield.Seed").setLevel(logging.CRITICAL)
    
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)

