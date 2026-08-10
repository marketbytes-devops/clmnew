from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from ..auth.utils import decode_token

class JWTMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Allow open access to auth routes and root route for redirect
        if request.url.path.startswith("/auth/") or request.url.path == "/" or request.url.path == "/test-db":
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            payload = decode_token(token)
            if payload:
                # Optionally add user ID to request state
                request.state.user_id = payload.get("sub")
        
        response = await call_next(request)
        return response
