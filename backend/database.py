from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# DATABASE_URL = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
DATABASE_URL = "sqlite:///./backend/database.db"  # <-- Используем SQLite файл

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})  # check_same_thread для SQLite
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Добавьте эту функцию
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
