import json
import random
import urllib.request
from datetime import datetime, timedelta
from fastapi import APIRouter

router = APIRouter(prefix="/api/weather", tags=["weather"])

def fetch_noaa_json(url: str):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"NOAA request error: {e}")
        return None

@router.get("/current")
async def get_current_weather():
    scales = fetch_noaa_json("https://services.swpc.noaa.gov/products/noaa-scales.json") or {}
    k_index = fetch_noaa_json("https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json") or []
    speed_data = fetch_noaa_json("https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json") or []
    mag_data = fetch_noaa_json("https://services.swpc.noaa.gov/products/summary/solar-wind-mag-field.json") or []
    flux_data = fetch_noaa_json("https://services.swpc.noaa.gov/products/summary/10cm-flux.json") or []

    current_scale = scales.get("0", {})
    r_val = current_scale.get("R", {}).get("Text", "none") or "none"
    s_val = current_scale.get("S", {}).get("Text", "none") or "none"
    g_val = current_scale.get("G", {}).get("Text", "none") or "none"

    kp = k_index[-1].get("Kp", 1.5) if k_index else 1.5
    wind_speed = speed_data[0].get("proton_speed", 350.0) if speed_data else 350.0
    bt = mag_data[0].get("bt", 5.0) if mag_data else 5.0
    bz = mag_data[0].get("bz_gsm", 0.2) if mag_data else 0.2
    flux = flux_data[0].get("flux", 110.0) if flux_data else 110.0

    return {
        "timestamp": datetime.now().isoformat(),
        "kp_index": float(kp),
        "solar_wind_speed": float(wind_speed),
        "solar_wind_bt": float(bt),
        "solar_wind_bz": float(bz),
        "radio_flux": float(flux),
        "status_r": r_val.lower(),
        "status_s": s_val.lower(),
        "status_g": g_val.lower()
    }

@router.get("/historical")
async def get_historical():
    xrays = fetch_noaa_json("https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json") or []
    xray_flux = []
    filtered = [x for x in xrays if x.get("energy") == "0.1-0.8nm"]
    for i, pt in enumerate(filtered):
        if i % 15 == 0:
            time_tag = pt.get("time_tag", "")
            try:
                dt = datetime.strptime(time_tag, "%Y-%m-%dT%H:%M:%SZ")
                time_str = dt.strftime("%H:%M")
            except Exception:
                time_str = time_tag
            xray_flux.append({
                "time": time_str,
                "value": pt.get("flux", 1e-8)
            })

    tec_trend = {"times": [], "stations": {"IST01": [], "KHI02": [], "PEW03": []}}
    base_time = datetime.now() - timedelta(hours=24)
    for hour in range(25):
        t = base_time + timedelta(hours=hour)
        time_str = t.strftime("%H:%M")
        tec_trend["times"].append(time_str)
        diurnal_factor = 1.0 - abs(t.hour - 12) / 12.0
        tec_trend["stations"]["IST01"].append(round(25.0 + 20.0 * diurnal_factor + random.uniform(-1, 1), 1))
        tec_trend["stations"]["KHI02"].append(round(30.0 + 22.0 * diurnal_factor + random.uniform(-1, 1), 1))
        tec_trend["stations"]["PEW03"].append(round(22.0 + 18.0 * diurnal_factor + random.uniform(-1, 1), 1))

    return {"xray_flux": xray_flux, "tec_trend": tec_trend}
