import time
from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()

_migration_complete = False
_start_time = time.monotonic()


def mark_ready():
    global _migration_complete
    _migration_complete = True


@router.get("/health")
async def health():
    if not _migration_complete:
        return JSONResponse(
            status_code=503,
            content={
                "status": "starting_up",
                "uptime": round(time.monotonic() - _start_time, 1),
            },
        )
    return {
        "status": "ok",
        "uptime": round(time.monotonic() - _start_time, 1),
    }
