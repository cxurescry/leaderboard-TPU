from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database import get_db
from models import User

def get_current_user(request: Request, db: Session = Depends(get_db)):
    """Зависимость для получения текущего пользователя"""
    user_info = request.session.get("user_info")
    if not user_info:
        raise HTTPException(status_code=401, detail="Не авторизован")
    
    user = db.query(User).filter(User.id == user_info["id"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="Пользователь не найден")
    
    return user

def login_required(request: Request):
    """Зависимость для проверки авторизации"""
    if not request.session.get("user_info"):
        raise HTTPException(status_code=401, detail="Не авторизован")
    return True
