from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db, Project, User, Investment
from models import ProjectCreate, ProjectResponse, ProjectUpdate, InvestmentCreate, InvestmentResponse
from typing import List
from datetime import datetime

router = APIRouter()

@router.post("/projects", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, creator_id: int, db: Session = Depends(get_db)):
    # Verify creator exists
    creator = db.query(User).filter(User.id == creator_id).first()
    if not creator or creator.role != "creator":
        raise HTTPException(status_code=404, detail="Creator not found")
    
    db_project = Project(
        name=project.name,
        description=project.description,
        category=project.category,
        target_revenue=project.target_revenue,
        image_url=project.image_url,
        creator_id=creator_id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    return ProjectResponse.from_orm(db_project)

@router.get("/projects", response_model=List[ProjectResponse])
async def get_projects(skip: int = 0, limit: int = 100, category: str = None, db: Session = Depends(get_db)):
    query = db.query(Project).filter(Project.is_active == True)
    
    if category:
        query = query.filter(Project.category == category)
    
    projects = query.offset(skip).limit(limit).all()
    return [ProjectResponse.from_orm(project) for project in projects]

@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectResponse.from_orm(project)

@router.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: int, project_update: ProjectUpdate, db: Session = Depends(get_db)):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    for field, value in project_update.dict(exclude_unset=True).items():
        setattr(db_project, field, value)
    
    db_project.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_project)
    
    return ProjectResponse.from_orm(db_project)

@router.delete("/projects/{project_id}")
async def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project.is_active = False
    db.commit()
    
    return {"message": "Project deactivated successfully"}

@router.post("/investments", response_model=InvestmentResponse)
async def create_investment(investment: InvestmentCreate, investor_id: int, db: Session = Depends(get_db)):
    # Verify investor exists
    investor = db.query(User).filter(User.id == investor_id).first()
    if not investor or investor.role != "investor":
        raise HTTPException(status_code=404, detail="Investor not found")
    
    # Verify project exists
    project = db.query(Project).filter(Project.id == investment.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db_investment = Investment(
        amount=investment.amount,
        nft_token_id=investment.nft_token_id,
        transaction_hash=investment.transaction_hash,
        investor_id=investor_id,
        project_id=investment.project_id
    )
    db.add(db_investment)
    
    # Update project revenue
    project.current_revenue += investment.amount
    project.updated_at = datetime.utcnow()
    
    # Update investor total invested
    investor.total_invested += investment.amount
    investor.updated_at = datetime.utcnow()
    
    # Update creator total revenue
    creator = db.query(User).filter(User.id == project.creator_id).first()
    if creator:
        creator.total_revenue += investment.amount
        creator.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_investment)
    
    return InvestmentResponse.from_orm(db_investment)

@router.get("/investments", response_model=List[InvestmentResponse])
async def get_investments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    investments = db.query(Investment).offset(skip).limit(limit).all()
    return [InvestmentResponse.from_orm(investment) for investment in investments]

@router.get("/projects/{project_id}/investments", response_model=List[InvestmentResponse])
async def get_project_investments(project_id: int, db: Session = Depends(get_db)):
    investments = db.query(Investment).filter(Investment.project_id == project_id).all()
    return [InvestmentResponse.from_orm(investment) for investment in investments]
