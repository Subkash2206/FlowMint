import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./flowmint.db")

# Render/Heroku fix: replace 'postgres://' with 'postgresql://'
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# For SQLite only, we need connect_args
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    wallet_address = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    role = Column(String, nullable=False)  # "creator" or "investor"
    bio = Column(Text)
    profile_image_url = Column(String)
    total_revenue = Column(Float, default=0.0)
    total_invested = Column(Float, default=0.0)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    projects = relationship("Project", back_populates="creator")
    investments = relationship("Investment", back_populates="investor")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String)  # "music", "art", "tech", "gaming"
    target_revenue = Column(Float)
    current_revenue = Column(Float, default=0.0)
    nft_token_id = Column(Integer, unique=True)
    nft_contract_address = Column(String)
    image_url = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    creator_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    creator = relationship("User", back_populates="projects")
    investments = relationship("Investment", back_populates="project")

class Investment(Base):
    __tablename__ = "investments"
    
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    nft_token_id = Column(Integer, nullable=False)
    transaction_hash = Column(String, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Foreign keys
    investor_id = Column(Integer, ForeignKey("users.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))
    
    # Relationships
    investor = relationship("User", back_populates="investments")
    project = relationship("Project", back_populates="investments")

class RevenueDistribution(Base):
    __tablename__ = "revenue_distributions"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    amount = Column(Float, nullable=False)
    distribution_percentage = Column(Float, nullable=False)
    transaction_hash = Column(String, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize database
create_tables()
