from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Student
from schemas import StudentResponse

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(request):  # Пока просто проверим сессию
    user = request.session.get('user')
    if not user:
        raise HTTPException(status_code=401, detail="Не авторизован")
    return user

@router.get("/api/profile/{login}", response_model=StudentResponse)
def get_profile(login: str, request, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    student = db.query(Student).filter(Student.login == login).first()
    if not student:
        raise HTTPException(status_code=404, detail="Студент не найден")
    # Возвращаем в том же формате, что и leaderboard
    return {
        "Место": 0,  # Не используется в профиле
        "ФИО": f"{student.last_name} {student.first_name} {student.patronymic}".strip(),
        "Школа": student.direction_name or student.faculty or "Не указано",
        "Группа": student.student_group,
        "Счет баллов": float(student.study_score) if student.study_score is not None else 0.0
    }