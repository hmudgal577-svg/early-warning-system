import httpx
import json

API_KEY = "rnd_bucCdcZJxs9puj8USFfHVGnNKBR0"
OWNER_ID = "tea-d93r7o57vvec73dj0aj0"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}

def create_database():
    payload = {
        "name": "ews-postgres-db",
        "ownerId": OWNER_ID,
        "databaseName": "ews_ner",
        "databaseUser": "ews_admin",
        "plan": "free",
        "region": "singapore",
        "version": "16"
    }
    with httpx.Client() as client:
        res = client.post("https://api.render.com/v1/postgres", headers=HEADERS, json=payload)
        print("Create DB Status:", res.status_code)
        print("Create DB Response:", res.text)
        return res.json()

if __name__ == "__main__":
    create_database()
