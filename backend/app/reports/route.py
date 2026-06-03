from datetime import datetime, timezone

from fastapi import APIRouter, Query, status

from app.reports.schema import (
    DashboardResponse,
    SpendingByCategoryItem,
    MonthlySummaryItem,
    AccountSummaryItem,
    IncomeStatementResponse,
)
from app.core.dependencies import ReportServiceDep, CurrentUserDep


router = APIRouter()


@router.get(
    "/dashboard",
    response_model=DashboardResponse,
    status_code=status.HTTP_200_OK,
)
async def dashboard(
    service: ReportServiceDep,
    current_user: CurrentUserDep,
):
    return await service.get_dashboard(current_user.id)


@router.get(
    "/spending-by-category",
    response_model=list[SpendingByCategoryItem],
    status_code=status.HTTP_200_OK,
)
async def spending_by_category(
    service: ReportServiceDep,
    current_user: CurrentUserDep,
    start_date: datetime | None = Query(default=None),
    end_date: datetime | None = Query(default=None),
):
    now = datetime.now(timezone.utc)
    start = start_date or now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    end = end_date or now
    return await service.get_spending_by_category(current_user.id, start, end)


@router.get(
    "/monthly-summary",
    response_model=list[MonthlySummaryItem],
    status_code=status.HTTP_200_OK,
)
async def monthly_summary(
    service: ReportServiceDep,
    current_user: CurrentUserDep,
    months: int = Query(default=12, ge=1, le=60),
):
    return await service.get_monthly_summary(current_user.id, months)


@router.get(
    "/account-summary",
    response_model=list[AccountSummaryItem],
    status_code=status.HTTP_200_OK,
)
async def account_summary(
    service: ReportServiceDep,
    current_user: CurrentUserDep,
):
    return await service.get_account_summary(current_user.id)


@router.get(
    "/income-statement",
    response_model=IncomeStatementResponse,
    status_code=status.HTTP_200_OK,
)
async def income_statement(
    service: ReportServiceDep,
    current_user: CurrentUserDep,
    year: int = Query(...),
    month: int = Query(..., ge=1, le=12),
):
    return await service.get_income_statement(current_user.id, year, month)
