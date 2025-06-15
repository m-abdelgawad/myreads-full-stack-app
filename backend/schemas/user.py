from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: EmailStr

    class Config:
        # pydantic-v2 replacement for `orm_mode = True`
        from_attributes = True
