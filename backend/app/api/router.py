from fastapi import APIRouter

from app.api.routes import assistant, auth, dynamics, health, institutions, me, orders, service_logs


api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(me.router, tags=["me"])
api_router.include_router(institutions.router, prefix="/institutions", tags=["institutions"])
api_router.include_router(health.router, tags=["health"])
api_router.include_router(dynamics.router, tags=["dynamics"])
api_router.include_router(service_logs.router, tags=["service-logs"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(assistant.router, prefix="/assistant", tags=["assistant"])
