from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base
from datetime import datetime
import uuid

class Student(Base):
    __tablename__ = "students"

    login = Column(String(50), primary_key=True)
    someone_id = Column(String(50))
    first_name = Column(String(100))
    last_name = Column(String(100))
    patronymic = Column(String(100))
    student_group = Column(String(20))
    direction_name = Column(String(100))
    study_year = Column(Integer)
    faculty = Column(String(100))
    study_score = Column(Float)
    debt_count = Column(Integer)

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    tpu_user_id = Column(Integer, unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    access_token = Column(String(500))
    refresh_token = Column(String(500))
    token_expires = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "tpu_user_id": self.tpu_user_id,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name
        }