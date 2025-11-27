from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from database import get_db
from models import User
from tpu_oauth import TPUOAuthService
from datetime import datetime, timedelta
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/login")
async def login(request: Request):
    """Перенаправление на авторизацию ТПУ"""
    auth_url, state = TPUOAuthService.get_auth_url()
    request.session["oauth_state"] = state
    return RedirectResponse(auth_url)

@router.get("/callback")
async def callback(
    request: Request,
    code: str = None,
    state: str = None,
    error: str = None,
    error_description: str = None,
    db: Session = Depends(get_db)
):
    """Обработка callback от ТПУ OAuth"""
    try:
        # Проверяем наличие ошибки
        if error:
            raise HTTPException(
                status_code=400,
                detail=f"Ошибка авторизации: {error_description or error}"
            )
        
        # Проверяем state для защиты от CSRF
        stored_state = request.session.get("oauth_state")
        if not stored_state or state != stored_state:
            raise HTTPException(status_code=400, detail="Неверный state параметр")
        
        # Проверяем наличие кода
        if not code:
            raise HTTPException(status_code=400, detail="Код авторизации не получен")
        
        # Получаем access_token
        token_data = TPUOAuthService.get_access_token(code)
        
        # Получаем информацию о пользователе
        user_info = TPUOAuthService.get_user_info(token_data["access_token"])
        
        # Сохраняем/обновляем пользователя в БД
        user = db.query(User).filter(User.tpu_user_id == user_info.get("user_id")).first()
        
        if not user:
            user = User(
                id=str(uuid.uuid4()),
                tpu_user_id=user_info.get("user_id"),
                email=user_info.get("email", ""),
                first_name=user_info.get("lichnost", {}).get("imya", ""),
                last_name=user_info.get("lichnost", {}).get("familiya", "")
            )
        
        user.access_token = token_data.get("access_token")
        user.refresh_token = token_data.get("refresh_token")
        
        # Расчет времени истечения токена
        expires_in = token_data.get("expires_in", 86400)  # 24 часа по умолчанию
        user.token_expires = datetime.utcnow() + timedelta(seconds=expires_in)
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Сохраняем в сессии
        request.session["user_id"] = user.id
        request.session["user_info"] = {
            "id": user.id,
            "tpu_user_id": user.tpu_user_id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name
        }
        request.session["access_token"] = token_data["access_token"]
        
        # Очищаем state
        request.session.pop("oauth_state", None)
        
        # Перенаправляем на главную
        return RedirectResponse("http://localhost:5173")  # На ваш фронтенд
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка авторизации: {str(e)}")

@router.get("/logout")
async def logout(request: Request):
    """Выход пользователя"""
    # Получаем URL для выхода из ТПУ
    logout_url = TPUOAuthService.get_logout_url("http://localhost:5173")  # На ваш фронтенд
    
    # Очищаем сессию
    request.session.clear()
    
    # Перенаправляем на выход из ТПУ
    return RedirectResponse(logout_url)

@router.get("/me")
async def get_current_user(request: Request):
    """Получение информации о текущем пользователе"""
    user_info = request.session.get("user_info")
    if not user_info:
        raise HTTPException(status_code=401, detail="Не авторизован")
    
    return user_info