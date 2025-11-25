"""Authentication middleware and utilities."""
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from app.core.database import get_supabase
from typing import Optional, Dict, Any

security = HTTPBearer()


async def verify_token(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> Dict[str, Any]:
    """
    Verify Supabase JWT token from Authorization header.
    
    Args:
        credentials: HTTP Bearer token credentials
        
    Returns:
        User data from verified token
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    token = credentials.credentials
    
    try:
        supabase = get_supabase()
        # Verify the token by getting the user
        response = supabase.auth.get_user(token)
        
        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return {
            "user_id": response.user.id,
            "email": response.user.email,
            "role": response.user.role if hasattr(response.user, "role") else "user"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> Dict[str, Any]:
    """Dependency to get current authenticated user."""
    return await verify_token(credentials)


async def verify_admin(
    user: Dict[str, Any] = Security(get_current_user)
) -> Dict[str, Any]:
    """
    Verify user has admin role.
    
    Args:
        user: Current authenticated user
        
    Returns:
        User data if admin
        
    Raises:
        HTTPException: If user is not an admin
    """
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user


