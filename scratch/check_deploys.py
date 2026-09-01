import httpx
import json

API_KEY = "rnd_bucCdcZJxs9puj8USFfHVGnNKBR0"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Accept": "application/json"
}

def check_deploys(service_id, name):
    with httpx.Client() as client:
        res = client.get(f"https://api.render.com/v1/services/{service_id}/deploys?limit=2", headers=HEADERS)
        print(f"--- Deploys for {name} ---")
        if res.status_code == 200:
            for item in res.json():
                dep = item["deploy"]
                print(f"Deploy ID: {dep['id']}, Status: {dep['status']}, Created: {dep['createdAt']}")
        else:
            print("Error:", res.status_code, res.text)

if __name__ == "__main__":
    check_deploys("srv-dabi9f5g1s2s73cqcav0", "ews-ai-engine")
    check_deploys("srv-dabi9415efls73arughg", "ews-backend-gateway")
