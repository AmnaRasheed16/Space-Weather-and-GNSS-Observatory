import logging
from datetime import datetime, timedelta

from backend.seed_utils import DEFAULT_USERS, DEFAULT_STATIONS
from backend.weather_sim import generate_historical_weather

logger = logging.getLogger("AetherShield.Seed")

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
