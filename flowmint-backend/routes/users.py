from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class User(BaseModel):
    walletAddress: str
    role: str

fake_db = {}  # Replace with real DB later

@router.post("/register")
async def register_user(user: User):
    fake_db[user.walletAddress] = user.role
    return {"message": "User registered successfully!"}

@router.get("/user/{wallet_address}")
async def get_user(wallet_address: str):
    role = fake_db.get(wallet_address)
    if role:
        return {"walletAddress": wallet_address, "role": role}
    return {"error": "User not found"}
