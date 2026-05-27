from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer

from app.core.dependencies import SessionDep
from app.users.service import UserService
from app.users.repository import UserRepo
from app.core.security import create_access_token, decode_access_token
from app.users.schema import Token, UserRead, UserCreate


router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# ------------------------------------------------------
# DEPENDENCIES
# ------------------------------------------------------

def get_user_service(db: SessionDep) -> UserService:
    repo = UserRepo(db)
    return UserService(repo)

ServiceDep = Annotated[UserService, Depends(get_user_service)]


# Get Current User : Dependency 
async def get_current_user(service: ServiceDep, token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_access_token(token)
        username: str = payload.get("sub")  #type: ignore
        if username is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception

    user = await service.get_user_by_username(username)
    if user is None:
        raise credentials_exception
    return user

# ------------------------------------------------------
# AUTH ROUTES
# ------------------------------------------------------

@router.post("/login", response_model=Token)
async def login(service: ServiceDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = await service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=user.username)
    return {"access_token": access_token, "token_type": "bearer"}


@router.post('/signup', response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(service: ServiceDep, new_user: UserCreate):
    return await service.create_user(new_user)

