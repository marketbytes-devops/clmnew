import urllib.request
import urllib.error
import mimetypes
import json

url = "http://127.0.0.1:8000/api/ai/parse-document"
boundary = "===Boundary==="
filename = "test_contract.txt"
file_content = b"Client: Hooli Inc\nObjective: Build website\nDeliverables:\n- Core design"

# Construct multipart body
body = (
    f"--{boundary}\r\n"
    f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
    f"Content-Type: text/plain\r\n\r\n"
).encode('utf-8') + file_content + f"\r\n--{boundary}--\r\n".encode('utf-8')

req = urllib.request.Request(
    url,
    data=body,
    headers={
        "Content-Type": f"multipart/form-data; boundary={boundary}"
    },
    method="POST"
)

try:
    print("Sending POST request using urllib...")
    with urllib.request.urlopen(req, timeout=10) as response:
        status = response.status
        resp_body = response.read().decode('utf-8')
        print(f"Status Code: {status}")
        print(f"Response: {resp_body}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code} - {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
