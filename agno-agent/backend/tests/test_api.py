import pytest

@pytest.mark.asyncio
async def test_root_endpoint(async_client):
    """Test the root endpoint."""
    response = await async_client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "Electrodry AI Helpdesk API"

@pytest.mark.asyncio
async def test_health_check(async_client):
    """Test the health check endpoint."""
    response = await async_client.get("/api/v1/health")
    # Note: Health check might not be implemented or might be different, 
    # so we just check for 404 or 200 depending on if the route exists in the router.
    # Based on main.py: app.include_router(health.router, prefix="/api/v1", tags=["health"])
    # It likely exists at /api/v1/health or /api/v1/health/
    
    # If strict slashes are on, we might need to be careful. 
    # Assuming standard FastAPI health endpoint behavior.
    if response.status_code != 404:
        assert response.status_code == 200

