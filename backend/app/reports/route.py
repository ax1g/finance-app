from datetime import datetime, timezone

from fastapi import APIRouter, Query, Request, Response, status

from app.accounts.model import Account
from app.categories.model import Category
from app.transactions.model import Transaction
from app.reports.schema import (
    DashboardResponse,
    SpendingByCategoryItem,
    MonthlySummaryItem,
    AccountSummaryItem,
    IncomeStatementResponse,
)
from app.core.cache import compute_etag, handle_etag
from app.core.dependencies import ReportServiceDep, CurrentUserDep, SessionDep


router = APIRouter()


@router.get(
    "/dashboard",
    response_model=DashboardResponse,
    status_code=status.HTTP_200_OK,
)
async def dashboard(
    request: Request,
    response: Response,
    service: ReportServiceDep,
    current_user: CurrentUserDep,
    db: SessionDep,
):
    etag = await compute_etag(db, current_user.id, Transaction, Account)
    if await handle_etag(request, response, etag):
        return Response(status_code=304)
    return await service.get_dashboard(current_user.id)


@router.get(
    "/spending-by-category",
    response_model=list[SpendingByCategoryItem],
    status_code=status.HTTP_200_OK,
)
async def spending_by_category(
    request: Request,
    response: Response,
    service: ReportServiceDep,
    current_user: CurrentUserDep,
    db: SessionDep,
    start_date: datetime | None = Query(default=None),
    end_date: datetime | None = Query(default=None),
):
    now = datetime.now(timezone.utc)
    start = start_date or now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    end = end_date or now
    etag = await compute_etag(db, current_user.id, Transaction, Category)
    if await handle_etag(request, response, etag):
        return Response(status_code=304)
    return await service.get_spending_by_category(current_user.id, start, end)


@router.get(
    "/income-by-category",
    response_model=list[SpendingByCategoryItem],
    status_code=status.HTTP_200_OK,
)
async def income_by_category(
    request: Request,
    response: Response,
    service: ReportServiceDep,
    current_user: CurrentUserDep,
    db: SessionDep,
    start_date: datetime | None = Query(default=None),
    end_date: datetime | None = Query(default=None),
):
    now = datetime.now(timezone.utc)
    start = start_date or now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    end = end_date or now
    etag = await compute_etag(db, current_user.id, Transaction, Category)
    if await handle_etag(request, response, etag):
        return Response(status_code=304)
    return await service.get_income_by_category(current_user.id, start, end)


@router.get(
    "/monthly-summary",
    response_model=list[MonthlySummaryItem],
    status_code=status.HTTP_200_OK,
)
async def monthly_summary(
    request: Request,
    response: Response,
    service: ReportServiceDep,
    current_user: CurrentUserDep,
    db: SessionDep,
    months: int = Query(default=12, ge=1, le=60),
):
    etag = await compute_etag(db, current_user.id, Transaction)
    if await handle_etag(request, response, etag):
        return Response(status_code=304)
    return await service.get_monthly_summary(current_user.id, months)


@router.get(
    "/account-summary",
    response_model=list[AccountSummaryItem],
    status_code=status.HTTP_200_OK,
)
async def account_summary(
    request: Request,
    response: Response,
    service: ReportServiceDep,
    current_user: CurrentUserDep,
    db: SessionDep,
    start_date: datetime | None = Query(default=None),
    end_date: datetime | None = Query(default=None),
):
    now = datetime.now(timezone.utc)
    start = start_date or now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    end = end_date or now
    etag = await compute_etag(db, current_user.id, Account, Transaction)
    if await handle_etag(request, response, etag):
        return Response(status_code=304)
    return await service.get_account_summary(current_user.id, start, end)


@router.get(
    "/income-statement",
    response_model=IncomeStatementResponse,
    status_code=status.HTTP_200_OK,
)
async def income_statement(
    request: Request,
    response: Response,
    service: ReportServiceDep,
    current_user: CurrentUserDep,
    db: SessionDep,
    year: int = Query(...),
    month: int = Query(..., ge=1, le=12),
):
    etag = await compute_etag(db, current_user.id, Transaction, Account)
    if await handle_etag(request, response, etag):
        return Response(status_code=304)
    return await service.get_income_statement(current_user.id, year, month)
