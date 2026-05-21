
from pydantic import BaseModel, Field, ConfigDict

from app.core.enums import CategoryType


# shared properties
class CategoryBase(BaseModel):
    name: str = Field(min_length=3, max_length=100)

    type: CategoryType

    description: str | None = Field(default=None, max_length=255)

    icon: str | None = Field(default=None, max_length=50)

    is_active: bool = Field(default=True)

    sort_order: int = Field(default=0)


# create schema
class CategoryCreate(CategoryBase):
    pass


# read schema
class CategoryRead(CategoryBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# update schema
class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=3, max_length=100)

    type: CategoryType | None = None

    description: str | None = Field(default=None, max_length=255)

    icon: str | None = Field(default=None, max_length=50)

    is_active: bool | None = Field(default=None)

    sort_order: int | None = Field(default=None)

