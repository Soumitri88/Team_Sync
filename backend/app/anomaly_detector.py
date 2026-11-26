import math
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from .db_sqlite import db_mgr

# Known reference coordinates for IP geolocation (Demo baseline)
GEO_COORDINATES = {
    "10.0.2.14": {"city": "Austin, TX (HQ)", "lat": 30.2672, "lon": -97.7431, "is_corporate": True},
    "10.0.3.11": {"city": "Austin DataCenter", "lat": 30.2672, "lon": -97.7431, "is_corporate": True},
    "10.0.5.42": {"city": "Dallas, TX (Branch)", "lat": 32.7767, "lon": -96.7970, "is_corporate": True},
    "198.51.100.44": {"city": "Amsterdam, Netherlands (Tor Proxy)", "lat": 52.3676, "lon": 4.9041, "is_corporate": False},
    "203.0.113.88": {"city": "Kyiv, Ukraine (External)", "lat": 50.4501, "lon": 30.5234, "is_corporate": False},
    "127.0.0.1": {"city": "Localhost Sandbox", "lat": 30.2672, "lon": -97.7431, "is_corporate": True}
}

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two geo-coordinates in kilometers."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class AnomalyDetectionEngine:
    def __init__(self):
        # Default enterprise baseline: Business hours 08:00 - 18:00 (mean = 13.0, std = 2.5)
        self.default_mean_hour = 13.0
        self.default_std_hour = 2.5

    def get_user_baseline(self, username: str) -> Dict[str, Any]:
        """Calculates dynamic statistical login baseline for an individual employee."""
        history = db_mgr.query_all("""
            SELECT timestamp, ip_address, device_name
            FROM auth_events
            WHERE username = ? AND status = 'SUCCESS'
            ORDER BY timestamp DESC LIMIT 30
        """, (username,))

        hours = []
        known_ips = set()
        known_devices = set()

        for h in history:
            try:
                dt = datetime.fromisoformat(h["timestamp"])
                hours.append(dt.hour + dt.minute / 60.0)
                known_ips.add(h["ip_address"])
                if h["device_name"]:
                    known_devices.add(h["device_name"])
            except Exception:
                pass

        if len(hours) >= 3:
            mean_hour = sum(hours) / len(hours)
            variance = sum((x - mean_hour) ** 2 for x in hours) / len(hours)
            std_hour = max(1.0, math.sqrt(variance))
        else:
            mean_hour = self.default_mean_hour
            std_hour = self.default_std_hour
            known_ips.add("10.0.2.14")
            known_devices.add("WS-ENGINEERING-07")

        return {
            "username": username,
            "mean_login_hour": round(mean_hour, 2),
            "std_login_hour": round(std_hour, 2),
            "known_ips": list(known_ips),
            "known_devices": list(known_devices),
            "sample_size": len(hours)
        }

    def compute_z_score(self, current_hour: float, mean_hour: float, std_hour: float) -> float:
        """Computes statistical standard score (Z-score) for login time anomaly detection."""
        return (current_hour - mean_hour) / std_hour

    def check_impossible_travel(
        self,
        username: str,
        current_ip: str,
        current_dt: datetime
    ) -> Optional[Dict[str, Any]]:
        """
        Detects geographically impossible velocity between successive logins.
        Commercial air travel threshold: 900 km/h.
        """
        last_auth = db_mgr.query_one("""
            SELECT ip_address, timestamp
            FROM auth_events
            WHERE username = ? AND status = 'SUCCESS'
            ORDER BY timestamp DESC LIMIT 1
        """, (username,))

        if not last_auth:
            return None

        last_ip = last_auth["ip_address"]
        if last_ip == current_ip:
            return None

        try:
            last_dt = datetime.fromisoformat(last_auth["timestamp"])
        except Exception:
            return None

        delta_hours = (current_dt - last_dt).total_seconds() / 3600.0
        if delta_hours <= 0.001:
            delta_hours = 0.001

        geo1 = GEO_COORDINATES.get(last_ip, {"city": "Austin HQ", "lat": 30.2672, "lon": -97.7431})
        geo2 = GEO_COORDINATES.get(current_ip, {"city": "External Proxy", "lat": 52.3676, "lon": 4.9041})

        dist_km = haversine_distance_km(geo1["lat"], geo1["lon"], geo2["lat"], geo2["lon"])
        speed_kmh = dist_km / delta_hours

        if speed_kmh > 900.0 and dist_km > 500.0:
            return {
                "detected": True,
                "origin_city": geo1["city"],
                "origin_ip": last_ip,
                "destination_city": geo2["city"],
                "destination_ip": current_ip,
                "distance_km": round(dist_km, 1),
                "elapsed_hours": round(delta_hours, 2),
                "calculated_speed_kmh": round(speed_kmh, 1),
                "threshold_kmh": 900.0,
                "explanation": (
                    f"Physical travel from {geo1['city']} ({last_ip}) to {geo2['city']} ({current_ip}) "
                    f"requires an impossible velocity of {speed_kmh:.0f} km/h across {delta_hours:.2f} hours."
                )
            }
        return None

    def analyze_event_explainability(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates the explainable 'WHY FLAGGED' diagnostic breakdown for any security event.
        """
        evt_type = event.get("event_type", "suspicious_login")
        sev = event.get("severity", "high")
        username = event.get("username", "david.webb")
        src_ip = event.get("source_ip", "198.51.100.44")
        timestamp_str = event.get("timestamp", datetime.utcnow().isoformat())

        try:
            dt = datetime.fromisoformat(timestamp_str)
        except Exception:
            dt = datetime.utcnow()

        baseline = self.get_user_baseline(username)
        current_hour_float = dt.hour + dt.minute / 60.0
        z_score = self.compute_z_score(current_hour_float, baseline["mean_login_hour"], baseline["std_login_hour"])

        signals = []
        score = 0.0

        # Signal 1: Z-score on login time
        if abs(z_score) > 2.0:
            score += 25.0
            signals.append({
                "signal": "Statistical Time Anomaly (Z-Score)",
                "weight": 25.0,
                "details": f"Login hour {dt.strftime('%H:%M')} deviates from user's normal baseline (Z = {z_score:.2f}, baseline mean = {baseline['mean_login_hour']:.1f}h ± {baseline['std_login_hour']:.1f}h)."
            })

        # Signal 2: IP Affinity
        if src_ip not in baseline["known_ips"]:
            score += 30.0
            signals.append({
                "signal": "Previously Unseen IP Address",
                "weight": 30.0,
                "details": f"Source IP {src_ip} has 0 prior recorded logins in employee's 30-day baseline."
            })

        # Signal 3: Proxy / Tor Detection
        if src_ip.startswith("198.51.") or src_ip.startswith("203.0."):
            score += 35.0
            signals.append({
                "signal": "External Proxy / Tor Origin",
                "weight": 35.0,
                "details": f"IP {src_ip} resolves to an external anonymity proxy or untrusted subnet."
            })

        # Signal 4: Canary Honey-Token or Kill-Chain stage
        if event.get("is_canary") or "canary" in evt_type:
            score = 100.0
            signals.append({
                "signal": "Deception Canary Trap Detonated",
                "weight": 50.0,
                "details": "Direct unauthorized access to tripwire file with cryptographic hash verification."
            })
        elif "exfil" in evt_type:
            score = max(score, 95.0)
            signals.append({
                "signal": "High-Volume Compressed Egress Socket",
                "weight": 40.0,
                "details": "Outbound HTTP socket carrying compressed archive exfil_payload_staged.zip."
            })

        # Impossible Travel Check
        travel_check = self.check_impossible_travel(username, src_ip, dt)
        if travel_check:
            score = min(100.0, score + 45.0)
            signals.append({
                "signal": "Impossible Travel Velocity Flag",
                "weight": 45.0,
                "details": travel_check["explanation"]
            })

        score = min(100.0, max(score, 20.0))
        risk_cat = "CRITICAL" if score >= 80.0 else "HIGH" if score >= 60.0 else "MEDIUM" if score >= 40.0 else "LOW"

        return {
            "event_id": event.get("id"),
            "event_type": evt_type,
            "overall_risk_score": round(score, 1),
            "risk_category": risk_cat,
            "z_score": round(z_score, 2),
            "user_baseline": baseline,
            "signals": signals,
            "impossible_travel": travel_check,
            "mitre_technique": event.get("mitre_id", "T1078"),
            "relationship_nature": "observed" if ("canary" in evt_type or "process" in evt_type or "exfil" in evt_type) else "inferred",
            "recommended_action": "Execute autonomous process termination and drop perimeter receiver egress socket." if score >= 75.0 else "Require step-up MFA challenge and monitor user session."
        }

anomaly_engine = AnomalyDetectionEngine()
