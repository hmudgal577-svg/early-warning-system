import httpx
import json

API_KEY = "rnd_bucCdcZJxs9puj8USFfHVGnNKBR0"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Accept": "application/json"}

def inspect_service(srv_id, name):
    with httpx.Client() as client:
        res = client.get(f"https://api.render.com/v1/services/{srv_id}", headers=HEADERS)
        print(f"=== {name} DETAILS ===")
        print(json.dumps(res.json(), indent=2))

if __name__ == "__main__":
    inspect_service("srv-dabi9f5g1s2s73cqcav0", "AI Engine")
    inspect_service("srv-dabi9415efls73arughg", "Backend")
