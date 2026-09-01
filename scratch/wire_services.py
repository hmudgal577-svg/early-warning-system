import httpx
import json

API_KEY = "rnd_bucCdcZJxs9puj8USFfHVGnNKBR0"
BACKEND_SERVICE_ID = "srv-dabi9415efls73arughg"
AI_SERVICE_ID = "srv-dabi9f5g1s2s73cqcav0"

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}

def set_backend_env_vars():
    env_vars = [
        {"key": "PORT", "value": "8080"},
        {"key": "SPRING_DATASOURCE_URL", "value": "jdbc:postgresql://dpg-dabi4rss728c73a0a0k0-a.singapore-postgres.render.com:5432/ews_ner"},
        {"key": "SPRING_DATASOURCE_USERNAME", "value": "ews_admin"},
        {"key": "SPRING_DATASOURCE_PASSWORD", "value": "W6QF3QfdxZt3RtwS5W23GOdBngSedaYg"},
        {"key": "OPENWEATHER_API_KEY", "value": "248691ae6b30abce7f3cf5a4319520d2"},
        {"key": "OPENTOPOGRAPHY_API_KEY", "value": "619ea4b33002a569b3ac0b851e8b51d2"},
        {"key": "AI_ENGINE_URL", "value": "https://ews-ai-engine.onrender.com"}
    ]
    with httpx.Client() as client:
        res = client.put(f"https://api.render.com/v1/services/{BACKEND_SERVICE_ID}/env-vars", headers=HEADERS, json=env_vars)
        print("Backend Env Vars Updated:", res.status_code, res.text)

def set_ai_env_vars():
    env_vars = [
        {"key": "PYTHON_VERSION", "value": "3.11.9"},
        {"key": "OPENWEATHER_API_KEY", "value": "248691ae6b30abce7f3cf5a4319520d2"},
        {"key": "OPENTOPOGRAPHY_API_KEY", "value": "619ea4b33002a569b3ac0b851e8b51d2"},
        {"key": "BACKEND_GATEWAY_URL", "value": "https://ews-backend-gateway.onrender.com"}
    ]
    with httpx.Client() as client:
        res = client.put(f"https://api.render.com/v1/services/{AI_SERVICE_ID}/env-vars", headers=HEADERS, json=env_vars)
        print("AI Engine Env Vars Updated:", res.status_code, res.text)

if __name__ == "__main__":
    set_backend_env_vars()
    set_ai_env_vars()
