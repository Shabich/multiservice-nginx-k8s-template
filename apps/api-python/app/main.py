from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import APIRouter, Depends, FastAPI, Request
from psycopg_pool import AsyncConnectionPool

from app.settings import settings


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    # open=False + wait=False: the app starts even if Postgres is not up yet (readyz reports it).
    async with AsyncConnectionPool(
        settings.database_url, min_size=1, max_size=5, open=False
    ) as pool:
        app.state.pool = pool
        yield


def get_pool(request: Request) -> AsyncConnectionPool:
    return request.app.state.pool


Pool = Annotated[AsyncConnectionPool, Depends(get_pool)]

app = FastAPI(
    title="api-python",
    lifespan=lifespan,
    docs_url=f"{settings.root_path}/docs",
    openapi_url=f"{settings.root_path}/openapi.json",
)


@app.get("/healthz", include_in_schema=False)
async def healthz() -> dict[str, str]:
    """Liveness probe: process is up (does not depend on the database)."""
    return {"status": "ok"}


@app.get("/readyz", include_in_schema=False)
async def readyz(pool: Pool) -> dict[str, str]:
    """Readiness probe: database reachable."""
    async with pool.connection(timeout=2) as conn:
        await conn.execute("SELECT 1")
    return {"status": "ready"}


api = APIRouter(prefix=settings.root_path)


@api.get("/info")
async def info(pool: Pool) -> dict[str, str]:
    async with pool.connection(timeout=2) as conn:
        cur = await conn.execute("SELECT version()")
        row = await cur.fetchone()
    return {"service": "api-python (FastAPI)", "database": row[0] if row else "unknown"}


app.include_router(api)
