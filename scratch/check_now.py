import httpx

API_KEY = "rnd_bucCdcZJxs9puj8USFfHVGnNKBR0"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Accept": "application/json"}

def check():
    with httpx.Client() as client:
        res = client.get("https://api.render.com/v1/services/srv-dabi9f5g1s2s73cqcav0/deploys?limit=1", headers=HEADERS)
        print("AI Engine Deploy:", res.json()[0]["deploy"]["status"])
        
        res2 = client.get("https://api.render.com/v1/services/srv-dabi9415efls73arughg/deploys?limit=1", headers=HEADERS)
        print("Backend Deploy:", res2.json()[0]["deploy"]["status"])

if __name__ == "__main__":
    check()
