from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db, User, Project, Investment
from models import UserCreate, UserResponse, UserUpdate, ProjectCreate, ProjectResponse, InvestmentCreate, InvestmentResponse, CreatorDashboard, InvestorDashboard, LoginRequest, AuthResponse
from typing import List
import secrets
from datetime import datetime, timedelta
import jwt

router = APIRouter()

# JWT Secret (in production, use environment variable)
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/register", response_model=AuthResponse)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(User.wallet_address == user.wallet_address).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User already registered")
    
    # Create new user
    db_user = User(
        wallet_address=user.wallet_address,
        username=user.username,
        email=user.email,
        role=user.role,
        bio=user.bio,
        profile_image_url=user.profile_image_url
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create access token
    access_token = create_access_token(data={"sub": str(db_user.id)})
    
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(db_user)
    )

@router.post("/login", response_model=AuthResponse)
async def login_user(login_data: LoginRequest, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.wallet_address == login_data.wallet_address).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create access token
    access_token = create_access_token(data={"sub": str(db_user.id)})
    
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(db_user)
    )

@router.get("/user/{wallet_address}", response_model=UserResponse)
async def get_user(wallet_address: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.wallet_address == wallet_address).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.from_orm(user)

@router.get("/users", response_model=List[UserResponse])
async def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(User).offset(skip).limit(limit).all()
    return [UserResponse.from_orm(user) for user in users]

@router.put("/user/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(db_user, field, value)
    
    db_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_user)
    
    return UserResponse.from_orm(db_user)

@router.get("/creator/{user_id}/dashboard", response_model=CreatorDashboard)
async def get_creator_dashboard(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role != "creator":
        raise HTTPException(status_code=404, detail="Creator not found")
    
    projects = db.query(Project).filter(Project.creator_id == user_id).all()
    investments = db.query(Investment).join(Project).filter(Project.creator_id == user_id).all()
    
    total_revenue = sum(project.current_revenue for project in projects)
    total_investors = len(set(inv.investor_id for inv in investments))
    
    return CreatorDashboard(
        user=UserResponse.from_orm(user),
        projects=[ProjectResponse.from_orm(project) for project in projects],
        total_revenue=total_revenue,
        total_investors=total_investors,
        recent_investments=[InvestmentResponse.from_orm(inv) for inv in investments[-5:]]
    )

@router.get("/investor/{user_id}/dashboard", response_model=InvestorDashboard)
async def get_investor_dashboard(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role != "investor":
        raise HTTPException(status_code=404, detail="Investor not found")
    
    investments = db.query(Investment).filter(Investment.investor_id == user_id).all()
    total_invested = sum(inv.amount for inv in investments)
    total_projects = len(set(inv.project_id for inv in investments))
    
    return InvestorDashboard(
        user=UserResponse.from_orm(user),
        investments=[InvestmentResponse.from_orm(inv) for inv in investments],
        total_invested=total_invested,
        total_projects=total_projects,
        recent_revenue=[]  # TODO: Implement revenue tracking
    )
