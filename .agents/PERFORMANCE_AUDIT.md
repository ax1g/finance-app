# Backend Performance Audit

> Generated: 2026-06-07
> Scope: `backend/app/` and `backend/alembic/`

Findings are grouped by impact. Each item links to the relevant file and includes a short rationale and a proposed fix.

---

## 🔴 High Impact

### 1. Transactions list response is unbounded by default; eager-loads related rows
**Files:** `backend/app/transactions/route.py:71-78`, `backend/app/transactions/model.py:46-67`, `backend/app/core/cache.py:14-19`

`GET /transactions` returns `list[TransactionRead]`, and each item eagerly loads `account`, `category`, and `to_account` via `lazy="selectin"` on the model. The Pydantic `TransactionRead` then nests full `AccountRead`/`CategoryRead` objects per row. For a user with 1,000 transactions, that's 1,000 rows + 1,000 categories + 2,000 accounts in a single response.

Worse: every request runs `compute_etag()` — an extra `SELECT MAX(updated_at)` per resource — **before** the route decides whether to return 304 or hit the data query. The ETag query can't reuse anything from the data fetch.

**Fix:**
- Switch to a flat `TransactionSummary` schema (id, date, amount, type, names only) for the list endpoint. Keep the nested shape for the single-resource endpoint.
- Add **keyset pagination** (cursor on `(txn_date, id)`) — the current `OFFSET` is correct but the supporting index `(user_id, txn_type, txn_date)` already in place (`4e8f6a2b9c1d`) doesn't include `id`, so ties fall back to sort. Add `(user_id, txn_type, txn_date DESC, id DESC)` to make cursor pagination O(log n) seek + range scan.
- Consider denormalizing `account.name` / `category.name` onto `transactions` (or a covering index that includes them) for the list endpoint so the join isn't needed at all.

### 2. Dashboard endpoint runs 5+ sequential round-trips
**File:** `backend/app/reports/service.py:27-85`

`get_dashboard` awaits sequentially: `get_account_overview` → `get_period_income_expenses` → `get_monthly_summary` → `get_top_spending_categories` → `get_recent_transactions`. With each query ~10–30 ms over the network to Neon, that's 50–150 ms minimum wall time, all in the request hot path. The route also runs an ETag query first.

**Fix:**
- Run the data queries concurrently with `asyncio.gather()`. The `AsyncSession` is safe for concurrent execution only if you use **separate sessions** — gather a single session risks deadlocks/ordering issues. Two options:
  - Open a fresh `AsyncSession` per coroutine in the service (cheap, no shared state).
  - Or use a single `gather` only for queries that don't share row mutations — most dashboard reads qualify.
- `get_monthly_summary` for 5 years is computed on **every** dashboard load even though the ETag almost never changes minute-to-minute. Cache the monthly summary result in memory keyed by `(user_id, year-month-bucket)` and invalidate on transaction write.

### 3. `adjust_balance` does a SELECT then UPDATE — read-modify-write race
**File:** `backend/app/accounts/repository.py:148-167`

```python
account = await self.db.get(Account, account_id)   # SELECT
if not account or account.user_id != user_id: ...
stmt = sa_update(Account).where(...).values(current_balance=Account.current_balance + delta)  # UPDATE
```

The SELECT is fully redundant: the `UPDATE` already filters by `user_id`, and the rowcount can distinguish "not found / not owned" from "success". Drop the SELECT — saves one round-trip on every adjustment path (opening balance creation, reversal of edits, etc.).

### 4. Connection pool has no explicit size and no `pool_size`/`max_overflow`
**File:** `backend/app/core/database.py:14-22`

`create_async_engine` uses SQLAlchemy defaults: `pool_size=5, max_overflow=10, pool_timeout=30`. With concurrent workers, requests will queue for connections. The custom `get_raw_connection` uses `engine.connect()` which also takes a connection from the same pool.

**Fix:**
- Set `pool_size=10, max_overflow=20` (or scale with `WEB_CONCURRENCY` × 2).
- Confirm `pool_recycle=3600` is safe with the actual Postgres/Neon idle limit (Neon scales to 0, which makes `pool_recycle` moot — the `pool_pre_ping=True` already handles it, so the cost is just one extra round-trip on first use of a recycled connection).

### 5. Login is an unauthenticated brute-force surface
**Files:** `backend/app/users/auth.py:19-28`, `backend/app/users/service.py:50-61`

No rate limiting on `/login`, `/forgot-password`, or `/verify-email`. Argon2 verify at ~100 ms × 5 in series = 500 ms per wrong-password attempt × no limit = trivial DoS / credential stuffing.

**Fix:**
- Add `slowapi` (or a small Redis-backed limiter) to `/login` (e.g. 5/min per IP) and `/forgot-password` (3/hr per IP).
- Consider timing normalization: a non-existent user should also spend ~100 ms.

---

## 🟠 Medium Impact

### 6. `compute_etag` does N queries when N models are passed
**File:** `backend/app/core/cache.py:14-19`

Each call iterates over models and runs a `SELECT MAX(updated_at) WHERE user_id = ?`. Routes pass 1–3 models, so 1–3 round-trips before the route body even runs. The result is recomputed on every request.

**Fix:**
- Combine into a single `UNION ALL` query per request: `SELECT MAX(updated_at) FROM transactions WHERE user_id=? UNION ALL SELECT MAX(...) FROM accounts ...` — or use a single cached `etags` table updated by triggers.
- Better: short-circuit with a `If-None-Match` from a recent response and skip the DB call entirely on warm requests via a 1–2 s in-process LRU keyed by user.

### 7. `_ensure_defaults` can be called per category-list request and races
**File:** `backend/app/categories/service.py:33-46`

```python
async def get_categories(...):
    categories = await self.repo.get(user_id, category_type)
    if not categories:
        await self._ensure_defaults(user_id)   # full list of 36 inserts
        categories = await self.repo.get(user_id, category_type)
```

Three issues:
- 36 individual `INSERT`s on signup-then-list path.
- Race: two concurrent requests on a fresh account both call `_ensure_defaults` and both succeed (36 × 2 = 72 inserts, some failing on unique constraint).
- A user calling `?category_type=income` first triggers the full default seed even if they only have 8 income categories, which then re-filters — wasteful.

**Fix:**
- Use `INSERT ... ON CONFLICT DO NOTHING` in one statement with the 36 rows, or `bulk_save_objects`.
- Check for "any categories exist for this user" with a cheap `SELECT EXISTS` instead of fetching the full filtered list.
- Wrap the seed in a `pg_advisory_xact_lock(hashtext(user_id::text))` to serialize per user.

### 8. `decrease_balance` does a SELECT-after-UPDATE to disambiguate errors
**File:** `backend/app/accounts/repository.py:121-143`

On `rowcount == 0` (insufficient funds OR not-found), it re-fetches the account. That's a second round-trip on the unhappy path. Cleaner: check `current_balance` from the `RETURNING` clause:

```python
stmt = (sa_update(Account)
        .where(Account.id == account_id, Account.user_id == user_id, Account.current_balance >= amount)
        .values(current_balance=Account.current_balance - amount)
        .returning(Account.current_balance, Account.user_id))
```

### 9. `UserRepo.get_by_username` / `get_by_email` use `func.lower()` — model declares plain unique constraint
**Files:** `backend/app/users/repository.py:65-77`, `backend/app/users/model.py:14-22`, `backend/alembic/versions/0928f55e70bf_make_username_and_email_case_insensitive.py`

The migration correctly added a functional unique index on `LOWER(username)` and `LOWER(email)`. ✅ But the model's `unique=True` on the columns is misleading: Postgres uses the btree index on the raw column, **not** the functional one, for the constraint check (the functional index is non-unique-constraint, just unique-index). The unique check on signup relies on the functional index being present, which it is, but the **model declaration** will cause SQLAlchemy to attempt creating a plain `UNIQUE` constraint on `users.username` if `Base.metadata.create_all` is ever run, breaking the case-insensitive invariant.

**Fix:**
- Either: drop `unique=True` from the model (let only the migration define the unique index), or keep `unique=True` and replace the migration's functional index with `LOWER(...)` columns. Pick one source of truth.

### 10. `get_by_username` returns `scalars().first()` — leaks which of username/email matched
**Files:** `backend/app/users/auth.py:19-28`, `backend/app/users/service.py:50-61`

`authenticate_user` does `get_by_username` then `get_by_email` if the first is `None`. Two round-trips on every login attempt. Combine into one query:

```python
select(User).where(or_(func.lower(User.username) == lookup, func.lower(User.email) == lookup))
```

### 11. `get_period_transactions` returns all transactions in range for the income statement
**File:** `backend/app/reports/repository.py:188-208`

`/reports/income-statement?year=2026&month=5` returns every transaction in the month (could be thousands) with `selectinload` for category + 2 accounts = a 3× row-multiplier. The Pydantic `IncomeStatementItem` is a flat row, so the `selectinload`s are wasted work — the route only uses `category.name`, `account.name`, `to_account.name`.

**Fix:**
- Use a projection query that joins and returns named columns only (similar to `get_top_spending_categories`), or `select(Transaction).options(load_only(Transaction.id, Transaction.txn_date, ...))` if you need ORM objects.

---

## 🟡 Low Impact / Cleanup

### 12. Background migrations: advisory lock is held on process kill
**File:** `backend/app/main.py:38-64`

The advisory lock is released in a `finally` block inside an async `with` — but if the process is killed, the lock survives until the Postgres connection drops (Neon scales to 0, then to 1, which resets). For local this is fine; for Neon it's effectively auto-released. **No action needed** unless you start running migrations against a long-lived prod DB.

### 13. `get_income_statement` runs 4 sequential queries
**File:** `backend/app/reports/service.py:172-194`

This fires 4 sequential queries (total balance, period income/expenses/adjustments, period income/expenses, period transactions). Combine the totals into a single query that computes `opening_balance` directly:

```sql
SELECT
  SUM(CASE WHEN txn_type = 'income' AND txn_date >= start THEN amount
           WHEN txn_type = 'expense' AND txn_date >= start THEN -amount
           ...
```

Or reuse the `get_total_balance` + a single `get_period_income_expenses_adjustments` and compute opening in Python. Currently the service does the first + the second + a *third* (`get_period_income_expenses`) which is a subset of the second.

### 14. `lock_for_update` is fetched but the result is discarded
**File:** `backend/app/accounts/repository.py:169-186`

The query is executed and the row is loaded — the calling code (`transactions/service.py:81-96`) just discards the return value. That's correct for `SELECT ... FOR UPDATE` (it locks the row), but the result hydration with eager-loaded `transactions` relationship could load thousands of rows into memory just to hold the lock. Lock with a minimal projection:

```python
stmt = select(Account.id).where(...).with_for_update()
```

### 15. `ETag` hash uses `timestamp()` (float seconds) — collisions on rapid updates
**File:** `backend/app/core/cache.py:26-27, 40-41`

`str(datetime.timestamp())` strips microseconds. Two updates within the same second produce the same ETag and the second update won't bust the cache. Use `isoformat()` or microsecond-precision hashing.

### 16. `get_period_income_expenses` and `_adjustments` are duplicate queries
**File:** `backend/app/reports/repository.py:80-139`

The two methods are 90% identical. The `_adjustments` variant is a strict superset. Remove the basic version and have callers ignore the third tuple element.

### 17. `UserRepo.get_users` returns *all* users system-wide
**File:** `backend/app/users/repository.py:39-46`

No pagination. Superuser listing will become O(n) over the entire user table. Add `limit/offset` query params.

### 18. `_reverse_txn` / `_apply_txn` lock accounts in a non-deterministic order
**File:** `backend/app/transactions/service.py:67-110`

`lock_for_update` is called in this order: `old.account_id`, `old.to_account_id`, `new.account_id`, `new.to_account_id`. Two concurrent updates that touch the same two accounts in swapped order will deadlock. Sort the `locked` set before issuing locks. Document this with a comment-free convention (sorted by UUID string is standard) or, better, use a single `SELECT ... FOR UPDATE` with `IN (...)`.

### 19. `cascade="all, delete-orphan"` on User relationships; no DB-level CASCADE
**File:** `backend/app/users/model.py:32-48`

For `User.tokens`, the `delete-orphan` cascade will cause a full token wipe on every refresh, and there's no DB-level CASCADE. If the user is deleted, the FKs on transactions/accounts/categories/tokens don't have `ON DELETE CASCADE` at the DB layer (only the ORM cascade), so a raw `DELETE FROM users` (or a migration script) will hit a FK violation. Add `ondelete="CASCADE"` to each `ForeignKey("users.id")` declaration.

### 20. ETag is computed only for GET routes (not actually a problem — listed for clarity)
**File:** `backend/app/transactions/route.py:24-37, 80-89, 100-114`

Routes that don't have an ETag (POST, PATCH, DELETE) don't call `compute_etag` — good. But the GET routes (the only ones that use it) still pay the cost on every request. See #6 for the fix.

### 21. No `response_model_exclude_none=True`
**Files:** `backend/app/transactions/route.py`, `backend/app/accounts/route.py`, `backend/app/categories/route.py`

`TransactionRead`, `AccountRead`, `CategoryRead` are returned with `None` fields included. For `TransactionRead` (which has many optional fields), this can add 200–500 bytes per row. Add `response_model_exclude_none=True` to the route decorators.

### 22. `Category.is_active` AND `Category.status` — duplicate boolean / enum
**File:** `backend/app/categories/model.py:23-32`

Both `is_active: bool` and `status: CategoryStatus` exist. The repository queries `status == ACTIVE` (line 39 in `categories/repository.py`) but never `is_active`. Either remove `is_active` (YAGNI) or use only `is_active` (simpler). The redundancy is a footgun for future devs.

### 23. `lifespan` could pre-warm the connection pool
**File:** `backend/app/main.py:71-75`

You could warm the engine connection pool here: `async with engine.connect() as c: await c.execute(text("SELECT 1"))` — saves the first-request latency on cold starts.

---

## Quick Wins (P0-ish, <1 hour each)

1. **#3** Drop the SELECT in `adjust_balance` — pure win, ~30 lines diff.
2. **#10** Combine `get_by_username` + `get_by_email` into one query — saves 1 round-trip on every login.
3. **#13** Combine income-statement queries — 4 round-trips → 2.
4. **#16** Deduplicate `get_period_income_expenses*` — cosmetic, but it's been copy-pasted.
5. **#21** `response_model_exclude_none=True` on transaction/account/category lists.
6. **#15** Fix ETag timestamp precision — bugfix, not optimization.
7. **#18** Sort lock keys before `with_for_update` — deadlock fix.

## Architectural Wins (P1, hours of work)

1. **#1** Flat list schema + keyset pagination for transactions.
2. **#2** Concurrent dashboard queries (or denormalized `dashboard_snapshots` table refreshed on txn write).
3. **#7** Bulk upsert default categories with `ON CONFLICT DO NOTHING` + advisory lock.
4. **#11** Projection queries for income statement (no `selectinload`).

## Need architectural changes

1. **#5** Rate limiting on auth endpoints — needs a cache backend (Redis or in-process LRU with limits).
2. **#4** Pool tuning — needs load-test data.
