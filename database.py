from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "postgresql://postgres.hlevdczmwvxqiohqdkjl:Roshan346%40%21%21@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"

engine = create_engine(
    DATABASE_URL,
    connect_args={"sslmode": "require"},
    pool_pre_ping=True  # 🔥 important for stability
)

SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()