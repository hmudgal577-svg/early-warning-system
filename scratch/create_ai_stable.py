import httpx
import json

API_KEY = "rnd_bucCdcZJxs9puj8USFfHVGnNKBR0"
OWNER_ID = "tea-d93r7o57vvec73dj0aj0"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Accept": "application/json", "Content-Type": "application/json"}

def check_and_create():
    with httpx.Client(timeout=60.0) as client:
        res = client.get("https://api.render.com/v1/services?limit=10", headers=HEADERS)
        services = res.json()
        existing_names = [s["service"]["name"] for s in services]
        print("Existing Services:", existing_names)

        if "ews-ai-engine" not in existing_names:
            ai_payload = {
                "autoDeploy": "yes",
                "name": "ews-ai-engine",
                "ownerId": OWNER_ID,
                "repo": "https://github.com/hmudgal577-svg/early-warning-system",
                "branch": "main",
                "rootDir": "ai_engine",
                "type": "web_service",
                "serviceDetails": {
                    "env": "docker",
                    "plan": "free",
                    "region": "singapore",
                    "dockerfilePath": "Dockerfile",
                    "dockerContext": ".",
                    "envVars": [
                        {"key": "PORT", "value": "8000"},
                        {"key": "OPENWEATHER_API_KEY", "value": "248691ae6b30abce7f3cf5a4319520d2"},
                        {"key": "OPENTOPOGRAPHY_API_KEY", "value": "619ea4b33002a569b3ac0b851e8b51d2"}
                    ]
                }
            }
            create_res = client.post("https://api.render.com/v1/services", headers=HEADERS, json=ai_payload)
            print("Create AI Service Status:", create_res.status_code)
            print(create_res.text)

if __name__ == "__main__":
    check_and_create()
