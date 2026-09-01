import httpx
import json

API_KEY = "rnd_bucCdcZJxs9puj8USFfHVGnNKBR0"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}

def trigger_deploy(service_id, name):
    with httpx.Client() as client:
        res = client.post(f"https://api.render.com/v1/services/{service_id}/deploys", headers=HEADERS, json={})
        print(f"Trigger deploy for {name}: Status {res.status_code}")
        print(res.text)

if __name__ == "__main__":
    trigger_deploy("srv-dabi9f5g1s2s73cqcav0", "ews-ai-engine")
    trigger_deploy("srv-dabi9415efls73arughg", "ews-backend-gateway")
