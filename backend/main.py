import os
import uuid
import logging
import random
from datetime import datetime, timedelta
from typing import List, Optional
import jwt
from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

from backend.database import get_database
from backend.models import (
    UserLogin, Token, StationCreate, StationResponse,
    SpaceWeatherCurrent, SpaceWeatherHistorical, UploadResponse, XRayFluxPoint
)
from backend.seed_data import verify_password, seed_database, DEFAULT_STATIONS

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AetherShield.Main")

# JWT configuration
SECRET_KEY = "aethershield_super_secret_jwt_key_2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120

app = FastAPI(title="AetherShield Space Weather & GNSS Observatory API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication token validation helper
async def get_current_user(token: str = Depends(lambda: None)):
    # Custom dependency that parses token from Authorization header manually to simplify client requests
    return token

def verify_token(auth_header: str) -> dict:
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session token")
        return {"username": username, "role": role}
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired or invalid")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- Startup & Seeding Events ---
@app.on_event("startup")
async def startup_db_client():
    db, is_mongo = await get_database()
    # Seed the database on startup so it contains test data immediately
    await seed_database(db, is_mongo)

# --- Routes: Authentication ---
@app.post("/api/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    db, is_mongo = await get_database()
    username = credentials.username
    password = credentials.password
    
    user = None
    if is_mongo:
        user = await db.users.find_one({"username": username})
    else:
        user = db.users.get(username)
        
    if not user or not verify_password(password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(data={"sub": username, "role": user["role"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": username,
        "role": user["role"]
    }

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

# --- Routes: Space Weather ---
@app.get("/api/weather/current")
async def get_current_weather():
    db, is_mongo = await get_database()
    if is_mongo:
        # Get the latest entry
        weather = await db.space_weather.find_one({}, sort=[("timestamp", -1)])
    else:
        weather = db.space_weather[-1] if db.space_weather else None
        
    if not weather:
        # Fallback if seed failed
        return {
            "timestamp": datetime.now().isoformat(),
            "kp_index": 1.5,
            "solar_wind_speed": 350.0,
            "solar_wind_bt": 5.0,
            "solar_wind_bz": 0.2,
            "radio_flux": 110.0,
            "status_r": "none",
            "status_s": "none",
            "status_g": "none"
        }
        
    return {
        "timestamp": weather["timestamp"],
        "kp_index": weather["kp_index"],
        "solar_wind_speed": weather["solar_wind_speed"],
        "solar_wind_bt": weather["solar_wind_bt"],
        "solar_wind_bz": weather["solar_wind_bz"],
        "radio_flux": weather["radio_flux"],
        "status_r": weather["status_r"],
        "status_s": weather["status_s"],
        "status_g": weather["status_g"]
    }

# --- Routes: Space Weather Historical ---
@app.get("/api/weather/historical")
async def get_historical(request: Request):
    auth_header = request.headers.get("Authorization")
    verify_token(auth_header) # Raises 401 if invalid
    
    db, is_mongo = await get_database()
    if is_mongo:
        weather = await db.space_weather.find_one({}, sort=[("timestamp", -1)])
    else:
        weather = db.space_weather[-1] if db.space_weather else None
        
    if not weather:
        return {"xray_flux": [], "tec_trend": []}
        
    return {
        "xray_flux": weather["xray_flux"],
        "tec_trend": weather["tec_trend"]
    }

# --- Routes: GNSS Stations ---
@app.get("/api/stations")
async def get_stations_endpoint(request: Request):
    auth_header = request.headers.get("Authorization")
    verify_token(auth_header)
    
    db, is_mongo = await get_database()
    if is_mongo:
        cursor = db.stations.find({})
        stations = []
        async for doc in cursor:
            # Format datetime
            doc["created_at"] = doc["created_at"].isoformat() if isinstance(doc.get("created_at"), datetime) else doc.get("created_at")
            doc.pop("_id", None)
            stations.append(doc)
    else:
        stations = list(db.stations.values())
        for doc in stations:
            if isinstance(doc.get("created_at"), datetime):
                doc["created_at"] = doc["created_at"].isoformat()
    return stations

@app.post("/api/stations", response_model=StationResponse)
async def create_station(station: StationCreate, request: Request):
    auth_header = request.headers.get("Authorization")
    user_info = verify_token(auth_header)
    
    # Check if role is admin
    if user_info["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Only Administrators can register new GNSS Stations."
        )
        
    db, is_mongo = await get_database()
    new_station = station.dict()
    new_station["created_at"] = datetime.now()
    
    if is_mongo:
        # Check if station already exists
        exists = await db.stations.find_one({"id": station.id})
        if exists:
            raise HTTPException(status_code=400, detail="Station ID already registered")
        await db.stations.insert_one(new_station)
    else:
        if station.id in db.stations:
            raise HTTPException(status_code=400, detail="Station ID already registered")
        db.stations[station.id] = new_station
        
    # Format return date
    new_station["created_at"] = new_station["created_at"].isoformat()
    return new_station

# --- Routes: Satellite Positions (Sky Plot Coordinates) ---
@app.get("/api/satellites")
async def get_satellites(request: Request):
    # Generate realistic satellite orbital paths
    # elevation: 0 to 90 degrees, azimuth: 0 to 360 degrees
    # seed coordinates with slight variations based on system time to show orbit movement
    time_factor = (datetime.now().minute * 60 + datetime.now().second) * 0.05
    
    satellites = []
    constellations = [
        {"prefix": "G", "name": "GPS", "count": 8, "color": "#2563eb"},
        {"prefix": "R", "name": "GLONASS", "count": 6, "color": "#ef4444"},
        {"prefix": "E", "name": "Galileo", "count": 7, "color": "#10b981"},
        {"prefix": "C", "name": "BeiDou", "count": 8, "color": "#eab308"}
    ]
    
    for c in constellations:
        for i in range(1, c["count"] + 1):
            sat_id = f"{c['prefix']}{i:02d}"
            # Compute azimuth and elevation using orbit simulations
            base_azimuth = (i * 360 / c["count"]) + time_factor
            azimuth = base_azimuth % 360
            
            # Elevation fluctuates
            elevation = 15 + 70 * (0.5 + 0.5 * (1.0 if i % 2 == 0 else -1.0) * (time_factor / 180).real)
            # Clip between 10 and 90 degrees
            elevation = max(10, min(90, elevation))
            
            # Signal to noise ratio (SNR) in dB-Hz
            snr = 30 + 18 * (elevation / 90) + random.uniform(-1.5, 1.5)
            
            satellites.append({
                "id": sat_id,
                "constellation": c["name"],
                "azimuth": round(azimuth, 1),
                "elevation": round(elevation, 1),
                "snr": round(snr, 1)
            })
            
    return satellites

# --- Routes: File Uploads & RINEX Parsing ---
@app.post("/api/upload")
async def upload_rinex(
    request: Request,
    file: UploadFile = File(...),
    station_id: Optional[str] = Form(None)
):
    auth_header = request.headers.get("Authorization")
    user_info = verify_token(auth_header)
    
    db, is_mongo = await get_database()
    
    # Simple RINEX header parser
    contents = await file.read()
    text = contents.decode("utf-8", errors="ignore")
    lines = text.split("\n")[:100]  # Read first 100 lines (standard header area)
    
    parsed_metadata = {
        "rinex_version": "Unknown",
        "station_name": station_id or "Unknown Station",
        "receiver_type": "Unknown",
        "antenna_type": "Unknown",
        "approx_xyz": [],
        "satellite_count": 24,
        "epoch_duration": "24 Hours"
    }
    
    file_type = "Generic Log File"
    if file.filename.endswith((".26o", ".obs", ".26O", ".OBS")):
        file_type = "RINEX Observation"
    elif file.filename.endswith((".26g", ".26n", ".nav")):
        file_type = "RINEX Navigation"
    elif file.filename.endswith((".log", ".txt")):
        file_type = "Station Log"
    
    # Run parsing check
    for line in lines:
        if len(line) < 60:
            continue
        header_label = line[60:].strip()
        header_val = line[:60].strip()
        
        if "RINEX VERSION / TYPE" in header_label:
            parsed_metadata["rinex_version"] = line[:20].strip()
        elif "MARKER NAME" in header_label:
            parsed_metadata["station_name"] = line[:60].strip()
        elif "REC # / TYPE / VERS" in header_label:
            parsed_metadata["receiver_type"] = line[20:40].strip() or "Standard GNSS Receiver"
        elif "ANT # / TYPE" in header_label:
            parsed_metadata["antenna_type"] = line[20:40].strip() or "Standard Choke Ring"
        elif "APPROX POSITION XYZ" in header_label:
            xyz = line[:60].split()
            parsed_metadata["approx_xyz"] = [float(x) for x in xyz] if len(xyz) >= 3 else []
            
    # Add simulation stats
    parsed_metadata["satellite_count"] = random.randint(22, 34)
    
    # Save upload record
    record = {
        "id": str(uuid.uuid4()),
        "filename": file.filename,
        "uploaded_by": user_info["username"],
        "uploaded_at": datetime.now().isoformat(),
        "status": "Completed",
        "file_type": file_type,
        "station_id": parsed_metadata["station_name"][:5].upper() if parsed_metadata["station_name"] else station_id,
        "satellite_count": parsed_metadata["satellite_count"],
        "epoch_duration": "24 Hours (30s sampling)"
    }
    
    # Write record
    if is_mongo:
        await db.uploads.insert_one(record)
    else:
        db.uploads.append(record)
        
    return {
        "status": "Success",
        "record": record,
        "parsed_metadata": parsed_metadata
    }

@app.get("/api/uploads")
async def get_uploads_endpoint(request: Request):
    auth_header = request.headers.get("Authorization")
    verify_token(auth_header)
    
    db, is_mongo = await get_database()
    if is_mongo:
        cursor = db.uploads.find({}).sort("uploaded_at", -1)
        uploads = []
        async for doc in cursor:
            doc.pop("_id", None)
            uploads.append(doc)
    else:
        uploads = sorted(db.uploads, key=lambda x: x["uploaded_at"], reverse=True)
    return uploads

# --- Static Web Pages Delivery ---
# Serve frontend folder
# Ensure the directory exists
frontend_path = os.path.abspath("frontend")
os.makedirs(frontend_path, exist_ok=True)

# Serve index.html
@app.get("/")
async def read_index():
    index_file = os.path.join(frontend_path, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return HTMLResponse(content="<h1>AetherShield: Space Weather & GNSS Observatory</h1><p>Frontend assets not found yet. Please deploy the frontend directory.</p>")

# Mount static files for style.css and app.js
app.mount("/static", StaticFiles(directory="frontend"), name="frontend")
