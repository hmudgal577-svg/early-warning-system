import httpx
import json

API_KEY = "rnd_bucCdcZJxs9puj8USFfHVGnNKBR0"
OWNER_ID = "tea-d93r7o57vvec73dj0aj0"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}

def create_ai_service():
    payload = {
        "autoDeploy": "yes",
        "name": "ews-ai-engine",
        "ownerId": OWNER_ID,
        "repo": "https://github.com/hmudgal577-svg/early-warning-system",
        "branch": "main",
        "rootDir": "ai_engine",
        "type": "web_service",
        "serviceDetails": {
            "env": "python",
            "plan": "free",
            "region": "singapore",
            "runtime": "python",
            "envSpecificDetails": {
                "buildCommand": "pip install -r requirements.txt",
                "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT"
            },
            "envVars": [
                {"key": "PYTHON_VERSION", "value": "3.11.9"},
                {"key": "OPENWEATHER_API_KEY", "value": "248691ae6b30abce7f3cf5a4319520d2"},
                {"key": "OPENTOPOGRAPHY_API_KEY", "value": "619ea4b33002a569b3ac0b851e8b51d2"}
            ]
        }
    }
    with httpx.Client() as client:
        res = client.post("https://api.render.com/v1/services", headers=HEADERS, json=payload)
        print("Create AI Service Status:", res.status_code)
        print(res.text)

if __name__ == "__main__":
    create_ai_service()
