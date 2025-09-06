from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User Models
class UserBase(BaseModel):
    wallet_address: str
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role: str
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None

class UserResponse(UserBase):
    id: int
    total_revenue: float
    total_invested: float
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Project Models
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    target_revenue: Optional[float] = None
    image_url: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    target_revenue: Optional[float] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

class ProjectResponse(ProjectBase):
    id: int
    current_revenue: float
    nft_token_id: Optional[int]
    nft_contract_address: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    creator_id: int
    
    class Config:
        from_attributes = True

# Investment Models
class InvestmentBase(BaseModel):
    amount: float
    nft_token_id: int
    transaction_hash: Optional[str] = None

class InvestmentCreate(InvestmentBase):
    project_id: int

class InvestmentResponse(InvestmentBase):
    id: int
    created_at: datetime
    investor_id: int
    project_id: int
    
    class Config:
        from_attributes = True

# Dashboard Models
class CreatorDashboard(BaseModel):
    user: UserResponse
    projects: List[ProjectResponse]
    total_revenue: float
    total_investors: int
    recent_investments: List[InvestmentResponse]

class InvestorDashboard(BaseModel):
    user: UserResponse
    investments: List[InvestmentResponse]
    total_invested: float
    total_projects: int
    recent_revenue: List[dict]

# Auth Models
class LoginRequest(BaseModel):
    wallet_address: str
    signature: Optional[str] = None

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
