import random
from datetime import datetime, timedelta

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
