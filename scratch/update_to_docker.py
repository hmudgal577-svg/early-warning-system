import httpx
import json

API_KEY = "rnd_bucCdcZJxs9puj8USFfHVGnNKBR0"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Accept": "application/json", "Content-Type": "application/json"}

def update_ai_service():
    service_id = "srv-dabi9f5g1s2s73cqcav0"
    payload = {
        "serviceDetails": {
            "env": "docker",
            "envSpecificDetails": {
                "dockerfilePath": "./Dockerfile",
                "dockerContext": "."
            }
        }
    }
    with httpx.Client() as client:
        res = client.patch(f"https://api.render.com/v1/services/{service_id}", headers=HEADERS, json=payload)
        print("Update AI Service:", res.status_code, res.text)

if __name__ == "__main__":
    update_ai_service()
