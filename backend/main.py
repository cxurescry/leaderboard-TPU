# main.py (ИСПРАВЛЕННЫЙ для отдачи статических файлов фронтенда и API)
from fastapi import FastAPI, Depends, Request, HTTPException
from fastapi.responses import RedirectResponse, FileResponse
from routes import leaderboard, auth, profile
from database import engine, Base
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from config import settings
from dependencies import login_required
from pydantic import BaseModel
import uuid
import os

# --- НАСТРОЙКА ПУТИ К СБОРКЕ ФРОНТЕНДА ---
# Убедитесь, что путь соответствует местоположению папки dist после сборки npm run build
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

# FRONTEND_BUILD_DIR = 

# if not os.path.exists(FRONTEND_BUILD_DIR):
#     print(f"ВНИМАНИЕ: Папка с фронтенд-билдом не найдена: {FRONTEND_BUILD_DIR}")
#     print("Убедитесь, что вы выполнили 'npm run build' в папке фронтенда и путь указан правильно.")

app = FastAPI()

# --- НАСТРОЙКА MIDDLEWARE ---
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

# --- CORS (для одного сервера) ---
# Разрешаем запросы с нашего же домена и порта
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- СОЗДАНИЕ ТАБЛИЦ БАЗЫ ДАННЫХ ---
Base.metadata.create_all(bind=engine)

# --- ПОДКЛЮЧЕНИЕ РОУТЕРОВ (обязательно до общего маршрута для index.html) ---
app.include_router(leaderboard.router)
app.include_router(auth.router)
app.include_router(profile.router)

# --- МОДЕЛЬ ДЛЯ ТЕСТОВОЙ АВТОРИЗАЦИИ ---
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

    # Перенаправляем на корень
    return RedirectResponse("/")

@app.get("/auth/debug-login")
async def debug_login(request: Request):
    """Тестовый логин с реальным редиректом на ТПУ"""
    from tpu_oauth import TPUOAuthService

    if not settings.TPU_CLIENT_ID or settings.TPU_CLIENT_ID == "your_client_id":
        return {
            "error": "Настройте ключи ТПУ",
            "message": "Замените TPU_CLIENT_ID, TPU_CLIENT_SECRET и TPU_API_KEY в .env файле на реальные значения",
            "dashboard_url": "https://api.tpu.ru/dashboard  " # Убедитесь, что пробелы убраны
        }

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
        "auth_url": settings.TPU_AUTH_URL # Убедитесь, что пробелы убраны
    }

# --- ОСНОВНОЙ МАРШРУТ ДЛЯ ОТДАЧИ index.html (должен быть ПОСЛЕ всех других маршрутов) ---
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    """
    Обслуживание Single Page Application (React).
    Все маршруты, не начинающиеся с /api/ или /auth/, и не являющиеся статическими файлами, будут отдавать index.html.
    Это позволяет React Router работать правильно.
    """
    # Логирование для отладки
    print(f"Запрос на: {full_path}")

    # Исключаем API маршруты
    if full_path.startswith("api/") or full_path.startswith("auth/"):
        raise HTTPException(status_code=404, detail="Not Found - API Route")

    # Проверяем, является ли запрос статическим файлом
    static_extensions = [".js", ".css", ".svg", ".png", ".jpg", ".jpeg", ".gif", ".ico", ".woff", ".woff2", ".ttf", ".otf", ".json", ".map"]
    if any(full_path.endswith(ext) for ext in static_extensions):
        file_path = os.path.join(STATIC_DIR, full_path)
        print(f"Ищу файл: {file_path}")
        if os.path.exists(file_path):
            print(f"Нашёл файл: {file_path}")
            return FileResponse(file_path)
        else:
            # Если файл не найден в указанном пути, попробуем найти его в корне dist
            # Например, если запрос был /assets/file.otf, но файла нет в assets/, попробуем /file.otf
            filename = os.path.basename(full_path)
            file_path_in_root = os.path.join(STATIC_DIR, filename)
            print(f"Ищу файл в корне: {file_path_in_root}")
            if os.path.exists(file_path_in_root):
                print(f"Нашёл файл в корне: {file_path_in_root}")
                return FileResponse(file_path_in_root)
            else:
                print(f"Файл не найден: {file_path}")
                raise HTTPException(status_code=404, detail=f"Файл не найден: {full_path}")

    # Для всех остальных запросов отдаём index.html
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    else:
        raise HTTPException(status_code=404, detail="Страница не найдена")

@app.get("/")
async def read_root():
    """
    Корневой маршрут для отдачи index.html.
    """
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    else:
        raise HTTPException(status_code=404, detail="Страница не найдена")
    
@app.get("/protected")
async def protected_route(auth_required: bool = Depends(login_required)):
    return {"message": "Это защищенный маршрут"}
