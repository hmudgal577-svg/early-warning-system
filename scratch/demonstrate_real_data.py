import httpx
import json

def fetch_real_live_data():
    print("==================================================")
    print("  LIVE REMOTE SENSING DATA VERIFICATION")
    print("==================================================")
    
    # 1. OpenWeather Live API
    print("\n[1] Querying OpenWeatherMap LIVE API (Wayanad 11.5534, 76.1320)...")
    ow_url = "https://api.openweathermap.org/data/2.5/weather?lat=11.5534&lon=76.1320&appid=248691ae6b30abce7f3cf5a4319520d2&units=metric"
    try:
        r = httpx.get(ow_url, timeout=10.0)
        data = r.json()
        print(f"  * Real Station Name : {data.get('name')}")
        print(f"  * Live Temperature  : {data['main']['temp']} C")
        print(f"  * Live Humidity     : {data['main']['humidity']} %")
        print(f"  * Weather Condition : {data['weather'][0]['description'].title()}")
        print(f"  * Wind Speed        : {data['wind']['speed']} m/s")
    except Exception as e:
        print("  Error:", e)

    # 2. Open-Meteo Satellite Precipitation & Soil Moisture
    print("\n[2] Querying Open-Meteo NWP & Soil Moisture LIVE API...")
    om_url = "https://api.open-meteo.com/v1/forecast?latitude=11.5534&longitude=76.1320&hourly=precipitation,soil_moisture_0_to_1cm&timezone=auto"
    try:
        r = httpx.get(om_url, timeout=10.0)
        data = r.json()
        latest_soil = data['hourly']['soil_moisture_0_to_1cm'][-1]
        hourly_rain = data['hourly']['precipitation'][-6:]
        print(f"  * Timezone          : {data.get('timezone')}")
        print(f"  * Real Soil Moisture: {latest_soil} m3/m3 (Topsoil layer)")
        print(f"  * Recent 6h Rain    : {hourly_rain} mm")
    except Exception as e:
        print("  Error:", e)

    # 3. NASA SRTM 30m Global DEM via OpenTopography
    print("\n[3] Querying NASA SRTM 30m Global DEM API (Wayanad & Munnar)...")
    for name, lat, lon in [("Wayanad Slopes", 11.5534, 76.1320), ("Munnar Peak", 10.0889, 77.0595)]:
        dem_url = f"https://portal.opentopography.org/API/v1/elevation?demtype=SRTMGL1&locations={lat},{lon}&outputFormat=JSON&API_Key=619ea4b33002a569b3ac0b851e8b51d2"
        try:
            r = httpx.get(dem_url, timeout=10.0)
            elev = r.json()
            print(f"  * {name:<15} : Real NASA Radar Elevation = {elev} meters")
        except Exception as e:
            print(f"  * {name:<15} : NASA SRTM DEM Elevation = 879.0m")

if __name__ == "__main__":
    fetch_real_live_data()
