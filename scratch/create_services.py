import httpx
import json

API_KEY = "rnd_bucCdcZJxs9puj8USFfHVGnNKBR0"
OWNER_ID = "tea-d93r7o57vvec73dj0aj0"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}

def create_ai_service(repo_url):
    payload = {
        "autoDeploy": "yes",
        "name": "ews-ai-engine",
        "ownerId": OWNER_ID,
        "repo": repo_url,
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
        return res.json()

def create_backend_service(repo_url):
    payload = {
        "autoDeploy": "yes",
        "name": "ews-backend-gateway",
        "ownerId": OWNER_ID,
        "repo": repo_url,
        "branch": "main",
        "rootDir": "backend",
        "type": "web_service",
        "serviceDetails": {
            "env": "docker",
            "plan": "free",
            "region": "singapore",
            "dockerfilePath": "Dockerfile",
            "envVars": [
                {"key": "PORT", "value": "8080"},
                {"key": "OPENWEATHER_API_KEY", "value": "248691ae6b30abce7f3cf5a4319520d2"},
                {"key": "OPENTOPOGRAPHY_API_KEY", "value": "619ea4b33002a569b3ac0b851e8b51d2"}
            ]
        }
    }
    with httpx.Client() as client:
        res = client.post("https://api.render.com/v1/services", headers=HEADERS, json=payload)
        print("Create Backend Service Status:", res.status_code)
        print(res.text)
        return res.json()

if __name__ == "__main__":
    import sys
    repo = sys.argv[1] if len(sys.argv) > 1 else "https://github.com/hmudgal577-svg/early-warning-system"
    create_ai_service(repo)
    create_backend_service(repo)
