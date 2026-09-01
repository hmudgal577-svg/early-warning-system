import httpx
import json

API_KEY = "rnd_bucCdcZJxs9puj8USFfHVGnNKBR0"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Accept": "application/json"}

def inspect_deploy(srv_id, name):
    with httpx.Client() as client:
        res = client.get(f"https://api.render.com/v1/services/{srv_id}/deploys?limit=1", headers=HEADERS)
        print(f"=== {name} ===")
        print(json.dumps(res.json(), indent=2))

if __name__ == "__main__":
    inspect_deploy("srv-dabi9f5g1s2s73cqcav0", "AI Engine")
    inspect_deploy("srv-dabi9415efls73arughg", "Backend")
