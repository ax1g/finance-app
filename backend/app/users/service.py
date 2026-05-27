import uuid

from app.users.repository import UserRepo
from app.users.schema import UserCreate, UserUpdate
from app.users.model import User
from app.core.security import get_password_hash, verify_password

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

        return await self.repo.create(new_user)


    async def authenticate_user(self, username: str, password: str) -> User | None:
        # try by username first, then by email
        user = await self.repo.get_by_username(username)
        if not user:
            user = await self.repo.get_by_email(username)

        if not user:
            return None

        if not verify_password(password, user.hashed_password):
            return None

        return user


    async def get_users(self):
        return await self.repo.get_users()


    async def get_user_by_id(self, user_id: uuid.UUID):
        return await self.repo.get_user_by_id(user_id)
    

    async def get_user_by_username(self, username: str):
        return await self.repo.get_by_username(username)


    async def update_user(self, user_id: uuid.UUID, data: UserUpdate):
        return await self.repo.update(user_id, data.model_dump(exclude_unset=True))
    
    
    async def delete_user(self, user_id):
        return await self.repo.delete(user_id)