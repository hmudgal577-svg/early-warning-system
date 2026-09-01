import httpx
import json

API_KEY = "rnd_bucCdcZJxs9puj8USFfHVGnNKBR0"
OWNER_ID = "tea-d93r7o57vvec73dj0aj0"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}

def list_services():
    with httpx.Client() as client:
        res = client.get("https://api.render.com/v1/services?limit=20", headers=HEADERS)
        print("Services:", res.status_code, res.text)
        
def list_databases():
    with httpx.Client() as client:
        res = client.get("https://api.render.com/v1/postgres?limit=20", headers=HEADERS)
        print("Databases:", res.status_code, res.text)

if __name__ == "__main__":
    list_services()
    list_databases()
