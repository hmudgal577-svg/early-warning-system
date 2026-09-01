import httpx
import json

API_KEY = "rnd_bucCdcZJxs9puj8USFfHVGnNKBR0"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Accept": "application/json"}

def check():
    with httpx.Client() as client:
        res = client.get("https://api.render.com/v1/services/srv-dabi9415efls73arughg/deploys?limit=1", headers=HEADERS)
        print(json.dumps(res.json(), indent=2))

if __name__ == "__main__":
    check()
