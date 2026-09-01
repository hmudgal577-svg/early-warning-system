import httpx
import json

API_KEY = "rnd_bucCdcZJxs9puj8USFfHVGnNKBR0"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}

def get_db_details():
    with httpx.Client() as client:
        res = client.get("https://api.render.com/v1/postgres?limit=10", headers=HEADERS)
        print("Postgres DB:", res.status_code, res.text)
        data = res.json()
        if isinstance(data, list) and len(data) > 0:
            db_id = data[0]["postgres"]["id"]
            # Get connection info
            conn_res = client.get(f"https://api.render.com/v1/postgres/{db_id}/connection-info", headers=HEADERS)
            print("DB Conn Info:", conn_res.status_code, conn_res.text)

def get_services():
    with httpx.Client() as client:
        res = client.get("https://api.render.com/v1/services?limit=10", headers=HEADERS)
        print("Services:", res.status_code)
        for item in res.json():
            srv = item["service"]
            print(f"Service: {srv['name']} ({srv['id']}) -> {srv.get('serviceDetails', {}).get('url')}")

if __name__ == "__main__":
    get_db_details()
    get_services()
