import random
from datetime import datetime
from fastapi import APIRouter

router = APIRouter(prefix="/api/satellites", tags=["satellites"])

@router.get("")
async def get_satellites():
    time_factor = (datetime.now().minute * 60 + datetime.now().second) * 0.05
    
    satellites = []
    constellations = [
        {"prefix": "G", "name": "GPS", "count": 8},
        {"prefix": "R", "name": "GLONASS", "count": 6},
        {"prefix": "E", "name": "Galileo", "count": 7},
        {"prefix": "C", "name": "BeiDou", "count": 8}
    ]
    
    for c in constellations:
        for i in range(1, c["count"] + 1):
            sat_id = f"{c['prefix']}{i:02d}"
            base_azimuth = (i * 360 / c["count"]) + time_factor
            azimuth = base_azimuth % 360
            
            elevation = 15 + 70 * (0.5 + 0.5 * (1.0 if i % 2 == 0 else -1.0) * (time_factor / 180).real)
            elevation = max(10, min(90, elevation))
            
            snr = 30 + 18 * (elevation / 90) + random.uniform(-1.5, 1.5)
            
            satellites.append({
                "id": sat_id,
                "constellation": c["name"],
                "azimuth": round(azimuth, 1),
                "elevation": round(elevation, 1),
                "snr": round(snr, 1)
            })
            
    return satellites
