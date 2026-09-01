import httpx
import json

def test_endpoints():
    client = httpx.Client(timeout=40.0)
    
    print("1. Testing Root:")
    try:
        r = client.get("https://ews-ai-engine.onrender.com/")
        print("Root Status:", r.status_code, r.json())
    except Exception as e:
        print("Root error:", e)
        
    print("\n2. Testing Health:")
    try:
        r = client.get("https://ews-ai-engine.onrender.com/health")
        print("Health Status:", r.status_code, r.json())
    except Exception as e:
        print("Health error:", e)

    print("\n3. Testing Live Weather Telemetry (Wayanad):")
    try:
        r = client.get("https://ews-ai-engine.onrender.com/api/v1/weather/live?lat=11.5534&lon=76.1320")
        print("Weather Status:", r.status_code, r.json())
    except Exception as e:
        print("Weather error:", e)

    print("\n4. Testing NASA SRTM 30m Elevation (Wayanad):")
    try:
        r = client.get("https://ews-ai-engine.onrender.com/api/v1/terrain/elevation?lat=11.5534&lon=76.1320")
        print("Elevation Status:", r.status_code, r.json())
    except Exception as e:
        print("Elevation error:", e)

    print("\n5. Testing AI Risk Assessment + NetworkX Rerouting (Wayanad):")
    try:
        r = client.get("https://ews-ai-engine.onrender.com/api/v1/risk-assessment?lat=11.5534&lon=76.1320&slope=38.5&regionName=Meppadi%2C%20Wayanad")
        print("Risk Assessment Status:", r.status_code)
        data = r.json()
        print("AI Score:", data["assessment"]["score"], "| Level:", data["assessment"]["level"])
        print("Protocol:", data["assessment"]["action_protocol"])
        print("Evacuation Status:", data["evacuation_plan"]["status"], "| Route:", data["evacuation_plan"]["safe_evacuation_route"])
    except Exception as e:
        print("Risk assessment error:", e)

if __name__ == "__main__":
    test_endpoints()
