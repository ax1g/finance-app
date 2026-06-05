import uuid
from datetime import timedelta

from app.users.repository import UserRepo
from app.users.schema import UserCreate, UserUpdate
from app.users.model import User
from app.categories.model import Category
from app.categories.defaults import DEFAULT_CATEGORIES
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.core.exceptions import AuthenticationError, AuthorizationError


class UserService:
    """
    Handles business logic of the user model.
    """

    def __init__(self, repo: UserRepo):
        self.repo = repo

    async def create_user(self, user_data: UserCreate):
        user_dict = user_data.model_dump()
        # hash the plain password before creating the user record
        plain_password = user_dict.pop("password")
        user_dict["hashed_password"] = get_password_hash(plain_password)
        new_user = User(**user_dict)

        user = await self.repo.create(new_user)

        # seed default categories for the new user
        for cat in DEFAULT_CATEGORIES:
            category = Category(
                name=cat["name"],
                type=cat["type"],
                icon=cat.get("icon"),
                description=cat.get("description"),
                sort_order=cat.get("sort_order", 0),
                user_id=user.id,
            )
            self.repo.db.add(category)

        await self.repo.db.commit()
        return user

    async def authenticate_user(self, username: str, password: str) -> User | None:
        lookup = username.lower()
        user = await self.repo.get_by_username(lookup)
        if not user:
            user = await self.repo.get_by_email(lookup)

        if not user:
            return None

        if not verify_password(password, user.hashed_password):
            return None

        return user

    async def get_users(self, is_superuser: bool):
        if not is_superuser:
            raise AuthorizationError("Not authorized: superuser privileges required.")
        return await self.repo.get_users()

    async def get_user_by_id(self, user_id: uuid.UUID):
        return await self.repo.get_by_id(user_id)

    async def get_user_by_username(self, username: str):
        return await self.repo.get_by_username(username)

    async def update_user(self, user_id: uuid.UUID, data: UserUpdate):
        user = await self.repo.update(user_id, data.model_dump(exclude_unset=True))
        await self.repo.db.commit()
        return user

    async def change_password(self, user_id: uuid.UUID, current_password: str, new_password: str):
        user = await self.repo.get_by_id(user_id)
        if not verify_password(current_password, user.hashed_password):
            raise AuthenticationError("Current password is incorrect.")
        hashed = get_password_hash(new_password)
        await self.repo.update(user_id, {"hashed_password": hashed})
        await self.repo.db.commit()

    async def forgot_password(self, email: str) -> str:
        user = await self.repo.get_by_email(email)
        if not user:
            return ""
        token = create_access_token(subject=email, expires_delta=timedelta(minutes=15))
        return token

    async def reset_password(self, token: str, new_password: str):
        try:
            payload = decode_access_token(token)
        except AuthenticationError:
            raise AuthenticationError("Invalid or expired reset token.")
        email = payload.get("sub")
        if not email:
            raise AuthenticationError("Invalid reset token.")
        user = await self.repo.get_by_email(email)
        if not user:
            raise AuthenticationError("Invalid reset token.")
        hashed = get_password_hash(new_password)
        await self.repo.update(user.id, {"hashed_password": hashed})
        await self.repo.db.commit()

    async def delete_user(self, user_id):
        user = await self.repo.delete(user_id)
        await self.repo.db.commit()
        return user
