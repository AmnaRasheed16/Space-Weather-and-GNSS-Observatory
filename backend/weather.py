from datetime import datetime
from fastapi import APIRouter, Request

from backend.database import get_database
from backend.auth import verify_token

router = APIRouter(prefix="/api/weather", tags=["weather"])

@router.get("/current")
async def get_current_weather():
    db, is_mongo = await get_database()
    if is_mongo:
        weather = await db.space_weather.find_one({}, sort=[("timestamp", -1)])
    else:
        weather = db.space_weather[-1] if db.space_weather else None
        
    if not weather:
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

@router.get("/historical")
async def get_historical(request: Request):
    auth_header = request.headers.get("Authorization")
    verify_token(auth_header)
    
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
