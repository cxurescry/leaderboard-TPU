from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from database import SessionLocal
from models import Student
import random

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/api/profile/{login}")
def get_profile(
    login: str, 
    db: Session = Depends(get_db)
):
    """Получение полного профиля пользователя (доступен без авторизации)"""
    student = db.query(Student).filter(Student.login == login).first()
    if not student:
        raise HTTPException(status_code=404, detail="Студент не найден")
    
    # Получаем место в рейтинге
    all_students = db.query(Student).order_by(desc(Student.study_score)).all()
    position = 1
    for idx, s in enumerate(all_students, 1):
        if s.login == student.login:
            position = idx
            break
    
    full_name = f"{student.last_name} {student.first_name} {student.patronymic}".strip()
    school = student.direction_name or student.faculty or "Не указано"
    score = float(student.study_score) if student.study_score is not None else 0.0
    
    # Определяем роль (пока только студент, позже можно добавить ментора)
    roles = ["Студент"]
    
    # Генерируем статистику (в реальном проекте это должно быть из отдельных таблиц)
    # Для MVP используем демо-данные
    projects_count = random.randint(2, 8)
    average_performance = round(score / 300 * 5, 2) if score > 0 else 0  # Примерная успеваемость
    total_hours = random.randint(100, 500)
    team_position = random.randint(1, 20) if random.random() > 0.3 else None  # Может быть без команды
    team_contribution = round(random.uniform(15, 45), 1) if team_position else None
    
    # Команды и проекты (демо-данные)
    projects = []
    for i in range(projects_count):
        projects.append({
            "name": f"Проект {i + 1}",
            "team": f"Команда {i + 1}",
            "status": "Завершен" if i < projects_count - 1 else "Текущий",
            "participation_time": f"{random.randint(1, 12)} месяцев",
            "role": random.choice(["Разработчик", "Дизайнер", "Аналитик", "Тестировщик", "Менеджер"]),
            "team_link": f"/team/{i + 1}"
        })
    
    # Данные для графиков (демо)
    weeks_data = []
    performance_data = []
    for i in range(20):  # 20 недель
        weeks_data.append({
            "week": f"Неделя {i + 1}",
            "hours": random.randint(5, 40)
        })
        performance_data.append({
            "week": f"Неделя {i + 1}",
            "score": round(average_performance + random.uniform(-0.5, 0.5), 2)
        })
    
    return {
        "login": student.login,
        "fullName": full_name,
        "firstName": student.first_name or "",
        "lastName": student.last_name or "",
        "patronymic": student.patronymic or "",
        "roles": roles,
        "avatar": None,  # URL к аватару, если есть
        
        # Основная информация
        "school": school,
        "direction": student.direction_name or student.faculty or "Не указано",
        "group": student.student_group or "Не указано",
        "course": student.study_year or "Не указано",
        "debts": student.debt_count or 0,
        
        # Статистика и рейтинги
        "statistics": {
            "projectsCount": projects_count,
            "averagePerformance": average_performance,
            "totalHours": total_hours,
            "individualRank": position,
            "teamRank": team_position,
            "teamContribution": team_contribution,
            "currentScore": round(score, 1)
        },
        
        # Команды и проекты
        "projects": projects,
        
        # Инфографика
        "charts": {
            "weeklyHours": weeks_data,
            "performance": performance_data
        }
    }
