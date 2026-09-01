import httpx
import json

API_KEY = "rnd_bucCdcZJxs9puj8USFfHVGnNKBR0"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Accept": "application/json"
}

def get_backend_build_logs():
    service_id = "srv-dabi9415efls73arughg"
    with httpx.Client() as client:
        res = client.get(f"https://api.render.com/v1/services/{service_id}/deploys?limit=1", headers=HEADERS)
        if res.status_code == 200:
            dep = res.json()[0]["deploy"]
            print("Backend Deploy ID:", dep["id"], "Status:", dep["status"])
            
if __name__ == "__main__":
    get_backend_build_logs()
