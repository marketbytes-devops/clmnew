import urllib.request
import json

try:
    print("Testing GET /api/contracts/requests...")
    with urllib.request.urlopen("http://127.0.0.1:8000/api/contracts/requests", timeout=5) as response:
        print(f"Status: {response.status}")
        data = json.loads(response.read().decode('utf-8'))
        print(f"Requests loaded: {len(data)}")
        if len(data) > 0:
            print(f"Sample: {data[0]}")
except Exception as e:
    print(f"Error: {e}")
