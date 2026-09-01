import httpx
import json
import time

API_KEY = "rnd_bucCdcZJxs9puj8USFfHVGnNKBR0"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Accept": "application/json"
}

def check_render_deploys():
    print("\n--- 1. RENDER CLOUD BUILD STATUS ---")
    services = [
        ("srv-dabi9f5g1s2s73cqcav0", "ews-ai-engine"),
        ("srv-dabi9415efls73arughg", "ews-backend-gateway")
    ]
    with httpx.Client(timeout=10.0) as client:
        for srv_id, name in services:
            res = client.get(f"https://api.render.com/v1/services/{srv_id}/deploys?limit=1", headers=HEADERS)
            if res.status_code == 200:
                dep = res.json()[0]["deploy"]
                print(f"[{name}] Status: {dep['status']} (Commit: {dep['commit']['message'][:40]}...)")
            else:
                print(f"[{name}] Error: {res.status_code}")

def test_ai_engine_endpoints():
    print("\n--- 2. TESTING PYTHON AI & TELEMETRY ENDPOINTS ---")
    base_url = "https://ews-ai-engine.onrender.com"
    endpoints = [
        ("/", "Root Gateway"),
        ("/health", "Health Check"),
        ("/api/v1/weather/live?lat=11.5534&lon=76.1320", "Open-Meteo & OpenWeather Live"),
        ("/api/v1/terrain/elevation?lat=11.5534&lon=76.1320", "NASA SRTM 30m Global DEM"),
        ("/api/v1/risk-assessment?lat=11.5534&lon=76.1320&slope=38.5&regionName=Meppadi%2C%20Wayanad", "AI XGBoost & Evacuation Rerouting")
    ]
    with httpx.Client(timeout=30.0) as client:
        for path, desc in endpoints:
            url = f"{base_url}{path}"
            try:
                t0 = time.time()
                res = client.get(url)
                dt = round((time.time() - t0) * 1000)
                print(f"✔ [{desc}] -> HTTP {res.status_code} ({dt}ms)")
                print(f"   Response Preview: {res.text[:140]}...")
            except Exception as e:
                print(f"✖ [{desc}] -> Failed: {e}")

def test_frontend_routes():
    print("\n--- 3. TESTING VERCEL FRONTEND DEPLOYMENT ---")
    base_url = "https://frontend-eta-rouge-44.vercel.app"
    routes = ["/", "/citizen", "/sih-dashboard", "/login", "/report"]
    with httpx.Client(timeout=15.0) as client:
        for r in routes:
            url = f"{base_url}{r}"
            try:
                res = client.get(url)
                print(f"✔ [Route {r}] -> HTTP {res.status_code} (Size: {len(res.text)} bytes)")
            except Exception as e:
                print(f"✖ [Route {r}] -> Failed: {e}")

if __name__ == "__main__":
    check_render_deploys()
    test_ai_engine_endpoints()
    test_frontend_routes()
