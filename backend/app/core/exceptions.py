class RepositoryError(Exception):
    """Base class for repository errors."""

    pass


class TransactionCreateError(RepositoryError):
    """Raised when a transaction cannot be created."""

    pass


class TransactionUpdateError(RepositoryError):
    """Raised when a transaction cannot be updated."""

    pass


class ResourceNotFoundError(Exception):
    """Raised when a specific record is not found in the database"""

    pass


class AccountDeleteError(Exception):
    """Raised when account has funds when try to delete"""
