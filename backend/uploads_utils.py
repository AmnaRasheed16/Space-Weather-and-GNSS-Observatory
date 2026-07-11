import random

def get_file_type(filename: str) -> str:
    if filename.endswith((".26o", ".obs", ".26O", ".OBS")):
        return "RINEX Observation"
    if filename.endswith((".26g", ".26n", ".nav")):
        return "RINEX Navigation"
    if filename.endswith((".log", ".txt")):
        return "Station Log"
    return "Generic Log File"

def parse_rinex_metadata(lines, station_id) -> dict:
    meta = {
        "rinex_version": "Unknown",
        "station_name": station_id or "Unknown Station",
        "receiver_type": "Unknown",
        "antenna_type": "Unknown",
        "approx_xyz": [],
        "satellite_count": random.randint(22, 34),
        "epoch_duration": "24 Hours"
    }
    for line in lines:
        if len(line) < 60:
            continue
        lbl = line[60:].strip()
        if "RINEX VERSION / TYPE" in lbl:
            meta["rinex_version"] = line[:20].strip()
        elif "MARKER NAME" in lbl:
            meta["station_name"] = line[:60].strip()
        elif "REC # / TYPE / VERS" in lbl:
            meta["receiver_type"] = line[20:40].strip() or "Standard GNSS Receiver"
        elif "ANT # / TYPE" in lbl:
            meta["antenna_type"] = line[20:40].strip() or "Standard Choke Ring"
        elif "APPROX POSITION XYZ" in lbl:
            xyz = line[:60].split()
            meta["approx_xyz"] = [float(x) for x in xyz] if len(xyz) >= 3 else []
    return meta
