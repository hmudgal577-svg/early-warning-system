import httpx

def test_vercel():
    routes = [
        "/",
        "/citizen",
        "/sih-dashboard",
        "/login",
        "/report"
    ]
    base = "https://frontend-eta-rouge-44.vercel.app"
    with httpx.Client(timeout=10.0) as client:
        print("=== TESTING VERCEL FRONTEND ROUTES ===")
        for r in routes:
            url = f"{base}{r}"
            res = client.get(url)
            print(f"Route {r:15} -> Status: {res.status_code} (Length: {len(res.text)} bytes)")

if __name__ == "__main__":
    test_vercel()
