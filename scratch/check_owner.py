import httpx
import json

API_KEY = "rnd_bucCdcZJxs9puj8USFfHVGnNKBR0"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}

def get_owner():
    with httpx.Client() as client:
        res = client.get("https://api.render.com/v1/owners", headers=HEADERS)
        print("Owners status:", res.status_code)
        print(res.text)
        data = res.json()
        if isinstance(data, list) and len(data) > 0:
            return data[0]["owner"]["id"]
        return None

if __name__ == "__main__":
    owner_id = get_owner()
    print("Owner ID:", owner_id)
