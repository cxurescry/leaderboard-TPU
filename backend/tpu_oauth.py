import requests
import secrets
from fastapi import HTTPException
from config import settings

class TPUOAuthService:
    @staticmethod
    def get_auth_url():
        """Генерация URL для авторизации через ТПУ"""
        state = secrets.token_urlsafe(16)
        
        params = {
            "client_id": settings.TPU_CLIENT_ID,
            "redirect_uri": settings.TPU_REDIRECT_URI,
            "response_type": "code",
            "state": state
        }
        
        auth_url = f"{settings.TPU_AUTH_URL}?{requests.compat.urlencode(params)}"
        return auth_url, state
    
    @staticmethod
    def get_access_token(code: str):
        """Получение access_token по коду авторизации"""
        data = {
            "client_id": settings.TPU_CLIENT_ID,
            "client_secret": settings.TPU_CLIENT_SECRET,
            "redirect_uri": settings.TPU_REDIRECT_URI,
            "code": code,
            "grant_type": "authorization_code"
        }
        
        try:
            response = requests.post(settings.TPU_TOKEN_URL, data=data)
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Ошибка получения токена: {response.text}"
                )
            
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @staticmethod
    def get_user_info(access_token: str):
        """Получение информации о пользователе"""
        params = {
            "apiKey": settings.TPU_API_KEY,
            "access_token": access_token
        }
        
        try:
            response = requests.get(settings.TPU_USER_INFO_URL, params=params)
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=400,
                    detail=f"Ошибка получения данных пользователя: {response.text}"
                )
            
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @staticmethod
    def get_logout_url(redirect_url: str):
        """Генерация URL для выхода"""
        return f"{settings.TPU_LOGOUT_URL}?redirect={requests.compat.quote(redirect_url)}"
