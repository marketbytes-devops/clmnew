import requests
res = requests.post("http://127.0.0.1:8000/api/v1/auth/set-password", json={"token": "fiX31P3vnwX-kGQ2JTGS3sxME1priItyLYrZbeuFhdg", "new_password": "password123"})
print(res.status_code, res.text)
