from fastapi import FastAPI, Depends, Request, HTTPException
from fastapi.responses import RedirectResponse
from routes import leaderboard, auth, profile
from database import engine, Base
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from config import settings
from dependencies import login_required
from pydantic import BaseModel
import uuid

app = FastAPI()

# Middleware для сессий
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Создание таблиц
Base.metadata.create_all(bind=engine)

# Подключение роутеров
app.include_router(leaderboard.router)
app.include_router(auth.router)
app.include_router(profile.router)

# Модель для тестовых данных пользователя
class TestUserData(BaseModel):
    first_name: str
    last_name: str
    email: str
    tpu_user_id: str

@app.post("/auth/test-login")
async def test_login(request: Request, user_data: TestUserData):
    """Тестовый логин с кастомными данными"""
    test_user = {
        "id": f"test-user-{user_data.tpu_user_id}",
        "tpu_user_id": int(user_data.tpu_user_id) if user_data.tpu_user_id.isdigit() else 12345,
        "email": user_data.email,
        "first_name": user_data.first_name,
        "last_name": user_data.last_name
    }
    
    request.session["user_id"] = test_user["id"]
    request.session["user_info"] = test_user
    
    return test_user

@app.post("/auth/logout")
async def logout_post(request: Request):
    """Выход пользователя (POST версия)"""
    request.session.clear()
    return {"message": "Logged out"}

@app.get("/auth/simple-login")
async def simple_login(request: Request):
    """Простой тестовый логин без ТПУ"""
    test_user = {
        "id": "test-user-123",
        "tpu_user_id": 12345,
        "email": "student@tpu.ru",
        "first_name": "Иван",
        "last_name": "Иванов"
    }
    
    request.session["user_id"] = test_user["id"]
    request.session["user_info"] = test_user
    
    return RedirectResponse("http://localhost:5173")

@app.get("/auth/debug-login")
async def debug_login(request: Request):
    """Тестовый логин с реальным редиректом на ТПУ"""
    from tpu_oauth import TPUOAuthService
    
    # Проверяем, есть ли ключи
    if not settings.TPU_CLIENT_ID or settings.TPU_CLIENT_ID == "your_client_id":
        return {
            "error": "Настройте ключи ТПУ",
            "message": "Замените TPU_CLIENT_ID, TPU_CLIENT_SECRET и TPU_API_KEY в .env файле на реальные значения",
            "dashboard_url": "https://api.tpu.ru/dashboard"
        }
    
    # Показываем параметры которые отправляются
    auth_url, state = TPUOAuthService.get_auth_url()
    return {
        "message": "Параметры авторизации",
        "client_id": settings.TPU_CLIENT_ID,
        "redirect_uri": settings.TPU_REDIRECT_URI,
        "auth_url": auth_url,
        "state": state
    }

@app.get("/auth/config")
async def check_config():
    """Проверка конфигурации OAuth"""
    return {
        "client_id": settings.TPU_CLIENT_ID,
        "client_secret_set": bool(settings.TPU_CLIENT_SECRET and settings.TPU_CLIENT_SECRET != "your_client_secret"),
        "api_key_set": bool(settings.TPU_API_KEY and settings.TPU_API_KEY != "your_api_key"),
        "redirect_uri": settings.TPU_REDIRECT_URI,
        "auth_url": settings.TPU_AUTH_URL
    }

@app.get("/")
def read_root():
    return {"message": "FastAPI Leaderboard API with OAuth"}

@app.get("/protected")
async def protected_route(auth_required: bool = Depends(login_required)):
    return {"message": "Это защищенный маршрут"}