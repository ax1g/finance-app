class AppError(Exception):
    """Base exception for all application errors."""


class AuthenticationError(AppError):
    """Raised when authentication fails (invalid credentials, expired token)."""


class AuthorizationError(AppError):
    """Raised when the user lacks permission for an operation."""


class ResourceNotFoundError(AppError):
    """Raised when a specific record is not found."""


class ConflictError(AppError):
    """Raised when an operation conflicts with current state (integrity, balance, etc.)."""


class RepositoryError(AppError):
    """Base for database/repository errors."""


class TransactionCreateError(RepositoryError):
    """Raised when a transaction cannot be created."""


class TransactionUpdateError(RepositoryError):
    """Raised when a transaction cannot be updated."""


class AccountDeleteError(ConflictError):
    """Raised when an account cannot be deleted (non-zero balance)."""
