import hashlib
import logging
from datetime import datetime, timedelta
import random

logger = logging.getLogger("AetherShield.Seed")

# Password security helper (using SHA-256 for absolute reliability on Windows without compiler issues)
def hash_password(password: str) -> str:
    salt = "aethershield_super_secret_salt_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

# --- High-fidelity seed datasets ---
DEFAULT_USERS = [
    {
        "username": "admin",
        "hashed_password": hash_password("admin123"),
        "role": "admin"
    },
    {
        "username": "scientist",
        "hashed_password": hash_password("scientist123"),
        "role": "scientist"
    }
]

DEFAULT_STATIONS = [
    {
        "id": "IST01",
        "name": "Islamabad Observatory (IST)",
        "latitude": 33.7294,
        "longitude": 73.0931,
        "receiver_type": "Trimble NetR9",
        "antenna_type": "TRM59800.00 NONE",
        "data_availability": 98.4,
        "status": "active",
        "created_at": datetime.now() - timedelta(days=60)
    },
    {
        "id": "KHI02",
        "name": "Karachi Coastal Station",
        "latitude": 24.8607,
        "longitude": 67.0011,
        "receiver_type": "Septentrio PolaRx5",
        "antenna_type": "SEPCHOKE_MC NONE",
        "data_availability": 99.1,
        "status": "active",
        "created_at": datetime.now() - timedelta(days=45)
    },
    {
        "id": "PEW03",
        "name": "Peshawar High-Altitude Station",
        "latitude": 34.0151,
        "longitude": 71.5249,
        "receiver_type": "Leica GR50",
        "antenna_type": "LEIAR25.R4 LEIT",
        "data_availability": 95.8,
        "status": "active",
        "created_at": datetime.now() - timedelta(days=30)
    },
    {
        "id": "QTA04",
        "name": "Quetta Valley Station",
        "latitude": 30.1798,
        "longitude": 66.9750,
        "receiver_type": "Trimble NetR9",
        "antenna_type": "TRM59800.00 NONE",
        "data_availability": 84.2,
        "status": "inactive",
        "created_at": datetime.now() - timedelta(days=12)
    }
]

def generate_historical_weather():
    # Simulated 24 hours of X-Ray flux (W/m^2)
    xray = []
    base_time = datetime.now() - timedelta(hours=24)
    # Background level around 1e-6 (C-class)
    for i in range(48): # 30 min intervals
        t = base_time + timedelta(minutes=i*30)
        time_str = t.strftime("%H:%M")
        
        # Add a simulated solar flare event around 14:00 (M-class or X-class peak)
        if 24 <= i <= 28:
            # Flare peak
            val = 1.2e-4 if i == 26 else (6.5e-5 if i in [25, 27] else 2.1e-5)
        else:
            val = 1.0e-6 + random.uniform(0.1e-6, 0.8e-6)
        xray.append({"time": time_str, "value": val})
    
    # 24 hours of general TEC trends (TECU values from 10 to 45)
    tec = []
    for i in range(24):
        t = base_time + timedelta(hours=i)
        time_str = t.strftime("%H:%M")
        
        # Diurnal pattern (high during noon/afternoon, low at night)
        hour = t.hour
        if 8 <= hour <= 18:
            base_val = 25.0 + 12.0 * random.uniform(0.8, 1.2) + (10.0 if 12 <= hour <= 15 else 0.0)
        else:
            base_val = 8.0 + 5.0 * random.uniform(0.7, 1.3)
            
        tec.append({"time": time_str, "IST01": base_val, "KHI02": base_val * 1.1, "PEW03": base_val * 0.95})
        
    return xray, tec

async def seed_database(db, is_mongo: bool):
    """Seed the selected database engine with default items."""
    xray, tec = generate_historical_weather()
    
    if is_mongo:
        # 1. Users
        await db.users.delete_many({})
        await db.users.insert_many(DEFAULT_USERS)
        
        # 2. Stations
        await db.stations.delete_many({})
        await db.stations.insert_many(DEFAULT_STATIONS)
        
        # 3. Space Weather Details
        await db.space_weather.delete_many({})
        await db.space_weather.insert_one({
            "timestamp": datetime.now(),
            "kp_index": 3.2,
            "solar_wind_speed": 393.0,
            "solar_wind_bt": 8.0,
            "solar_wind_bz": -1.2,
            "radio_flux": 125.0,
            "status_r": "minor", # R1
            "status_s": "none",
            "status_g": "none",
            "xray_flux": xray,
            "tec_trend": tec
        })
        
        # 4. Uploads
        await db.uploads.delete_many({})
        await db.uploads.insert_one({
            "id": "d3b07384-d113-4c91-b3b3-0570b59b12d5",
            "filename": "ist_station_2026_07_07.26o",
            "uploaded_by": "admin",
            "uploaded_at": datetime.now() - timedelta(hours=5),
            "status": "Completed",
            "file_type": "RINEX Observation",
            "station_id": "IST01",
            "satellite_count": 28,
            "epoch_duration": "24 Hours"
        })
        logger.info("Successfully seeded MongoDB database.")
    else:
        # Seeding mock memory database
        db.users = {u["username"]: u for u in DEFAULT_USERS}
        db.stations = {s["id"]: s for s in DEFAULT_STATIONS}
        db.space_weather = [{
            "timestamp": datetime.now(),
            "kp_index": 3.2,
            "solar_wind_speed": 393.0,
            "solar_wind_bt": 8.0,
            "solar_wind_bz": -1.2,
            "radio_flux": 125.0,
            "status_r": "minor",
            "status_s": "none",
            "status_g": "none",
            "xray_flux": xray,
            "tec_trend": tec
        }]
        db.uploads = [{
            "id": "d3b07384-d113-4c91-b3b3-0570b59b12d5",
            "filename": "ist_station_2026_07_07.26o",
            "uploaded_by": "admin",
            "uploaded_at": datetime.now() - timedelta(hours=5),
            "status": "Completed",
            "file_type": "RINEX Observation",
            "station_id": "IST01",
            "satellite_count": 28,
            "epoch_duration": "24 Hours"
        }]
        logger.info("Successfully seeded in-memory mock database.")
