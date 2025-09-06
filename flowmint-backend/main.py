from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.users import router as users_router
from routes.projects import router as projects_router
from database import get_db, User, Project, Investment
from sqlalchemy.orm import Session
import random
from datetime import datetime

app = FastAPI(title="FlowMint API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users_router, prefix="/api")
app.include_router(projects_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "FlowMint API is running!", "version": "1.0.0"}

@app.on_event("startup")
async def startup_event():
    """Initialize demo data on startup"""
    db = next(get_db())
    
    # Check if demo data already exists
    if db.query(User).count() > 0:
        return
    
    # Create demo users
    demo_users = [
        {
            "wallet_address": "0x1234567890123456789012345678901234567890",
            "username": "alice_creator",
            "email": "alice@example.com",
            "role": "creator",
            "bio": "AI Artist creating unique digital masterpieces",
            "profile_image_url": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
        },
        {
            "wallet_address": "0x2345678901234567890123456789012345678901",
            "username": "bob_creator",
            "email": "bob@example.com",
            "role": "creator",
            "bio": "Music producer and composer",
            "profile_image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
        },
        {
            "wallet_address": "0x3456789012345678901234567890123456789012",
            "username": "charlie_investor",
            "email": "charlie@example.com",
            "role": "investor",
            "bio": "Crypto investor and NFT enthusiast",
            "profile_image_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
        },
        {
            "wallet_address": "0x4567890123456789012345678901234567890123",
            "username": "diana_investor",
            "email": "diana@example.com",
            "role": "investor",
            "bio": "Early stage investor in creative projects",
            "profile_image_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
        }
    ]
    
    for user_data in demo_users:
        user = User(**user_data)
        db.add(user)
    
    db.commit()
    
    # Get created users
    creators = db.query(User).filter(User.role == "creator").all()
    investors = db.query(User).filter(User.role == "investor").all()
    
    # Create demo projects
    demo_projects = [
        {
            "name": "Cyber Wolf NFT Collection",
            "description": "A unique collection of AI-generated wolf NFTs with cyberpunk aesthetics",
            "category": "art",
            "target_revenue": 10000.0,
            "current_revenue": 2500.0,
            "nft_token_id": 1,
            "nft_contract_address": "0x1234567890123456789012345678901234567890",
            "image_url": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
            "creator_id": creators[0].id
        },
        {
            "name": "Neon Tiger Music Project",
            "description": "Electronic music album with NFT ownership rights",
            "category": "music",
            "target_revenue": 5000.0,
            "current_revenue": 1200.0,
            "nft_token_id": 2,
            "nft_contract_address": "0x1234567890123456789012345678901234567890",
            "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
            "creator_id": creators[1].id
        },
        {
            "name": "Tech Innovation Hub",
            "description": "Revolutionary tech project with revenue sharing",
            "category": "tech",
            "target_revenue": 25000.0,
            "current_revenue": 5000.0,
            "nft_token_id": 3,
            "nft_contract_address": "0x1234567890123456789012345678901234567890",
            "image_url": "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
            "creator_id": creators[0].id
        }
    ]
    
    for project_data in demo_projects:
        project = Project(**project_data)
        db.add(project)
    
    db.commit()
    
    # Get created projects
    projects = db.query(Project).all()
    
    # Create demo investments
    demo_investments = [
        {
            "amount": 500.0,
            "nft_token_id": 1,
            "transaction_hash": f"0x{random.randint(100000, 999999)}",
            "investor_id": investors[0].id,
            "project_id": projects[0].id
        },
        {
            "amount": 1000.0,
            "nft_token_id": 1,
            "transaction_hash": f"0x{random.randint(100000, 999999)}",
            "investor_id": investors[1].id,
            "project_id": projects[0].id
        },
        {
            "amount": 300.0,
            "nft_token_id": 2,
            "transaction_hash": f"0x{random.randint(100000, 999999)}",
            "investor_id": investors[0].id,
            "project_id": projects[1].id
        },
        {
            "amount": 2000.0,
            "nft_token_id": 3,
            "transaction_hash": f"0x{random.randint(100000, 999999)}",
            "investor_id": investors[1].id,
            "project_id": projects[2].id
        }
    ]
    
    for investment_data in demo_investments:
        investment = Investment(**investment_data)
        db.add(investment)
    
    db.commit()
    db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
