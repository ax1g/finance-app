import uuid

from app.users.repository import UserRepo
from app.users.schema import UserCreate, UserUpdate
from app.users.model import User

class UserService:
    """
        Handles business logic of the user model.
    """

    def __init__(self, repo: UserRepo):
        self.repo = repo

    
    async def create_user(self, user_data: UserCreate):
        user_dict = user_data.model_dump()
        new_user = User(**user_dict)

        return await self.repo.create(new_user)

    async def get_users(self):
        return await self.repo.get_users()

    async def get_user_by_id(self, user_id: uuid.UUID):
        return await self.repo.get_user_by_id(user_id)

    async def update_user(self, user_id: uuid.UUID, data: UserUpdate):
        return await self.repo.update(user_id, data.model_dump(exclude_unset=True))
    
    async def delete_user(self, user_id):
        return await self.repo.delete(user_id)