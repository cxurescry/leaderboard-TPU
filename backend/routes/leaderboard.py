from fastapi import APIRouter, Query, Depends, HTTPException
from sqlalchemy import asc, desc
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Student
from schemas import StudentResponse
from typing import List, Optional, Dict
from starlette.requests import Request
from datetime import datetime, timedelta
import random

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# def get_current_user(request: Request):
#     user = request.session.get('user')
#     if not user:
#         raise HTTPException(status_code=401, detail="Не авторизован")
#     return user

@router.get("/api/leaderboard", response_model=List[StudentResponse])
def get_leaderboard(
    request: Request,  # <-- Теперь правильно
    search: Optional[str] = Query(None),
    school: Optional[str] = Query(None),
    group: Optional[str] = Query(None),
    min_score: Optional[float] = Query(None),
    max_score: Optional[float] = Query(None),
    sort_by: Optional[str] = Query(None),  # 'group', 'school', 'year', 'score'
    sort_order: Optional[str] = Query("desc"),  # 'asc' или 'desc'
    db: Session = Depends(get_db),
    # user: dict = Depends(get_current_user)
):
    query = db.query(Student)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Student.first_name.ilike(search_pattern)) |
            (Student.last_name.ilike(search_pattern)) |
            (Student.patronymic.ilike(search_pattern)) |
            (Student.direction_name.ilike(search_pattern)) |
            (Student.student_group.ilike(search_pattern))
        )

    if school:
        query = query.filter(Student.direction_name == school)

    if group:
        query = query.filter(Student.student_group == group)

    if min_score is not None:
        query = query.filter(Student.study_score >= min_score)

    if max_score is not None:
        query = query.filter(Student.study_score <= max_score)

    # Определяем поле сортировки
    order_field = None

    if sort_by == "group":
        order_field = Student.student_group
    elif sort_by == "school":
        order_field = Student.direction_name
    elif sort_by == "year":
        order_field = Student.study_year
    elif sort_by == "score":
        order_field = Student.study_score
    else:
        order_field = Student.study_score  # по умолчанию

    # Применяем сортировку
    if sort_order == "asc":
        query = query.order_by(asc(order_field))
    else:
        query = query.order_by(desc(order_field))

    students = query.all()

    result = []
    for idx, s in enumerate(students, 1):
        full_name = f"{s.last_name} {s.first_name} {s.patronymic}".strip()
        school = s.direction_name or s.faculty or "Не указано"
        score = float(s.study_score) if s.study_score is not None else 0.0

        result.append({
            "Место": idx,
            "ФИО": full_name,
            "Школа": school,
            "Группа": s.student_group,
            "Счет_баллов": score,
            "login": s.login
        })

    return result


def find_student_by_user_email(user_email: str, db: Session) -> Optional[Student]:
    """Находит студента по email пользователя"""
    if not user_email:
        return None
    
    # Пытаемся найти по логину (часть email до @)
    login_from_email = user_email.split('@')[0]
    student = db.query(Student).filter(Student.login == login_from_email).first()
    
    if student:
        return student
    
    # Пытаемся найти по части email
    students = db.query(Student).all()
    for s in students:
        # Если логин совпадает с частью email или похож
        if s.login and login_from_email.lower() in s.login.lower():
            return s
    
    return None


@router.get("/api/user/rank")
def get_user_rank(
    request: Request,
    db: Session = Depends(get_db)
):
    """Получает место текущего пользователя в рейтинге"""
    user_info = request.session.get("user_info")
    if not user_info:
        raise HTTPException(status_code=401, detail="Не авторизован")
    
    user_email = user_info.get("email", "")
    student = find_student_by_user_email(user_email, db)
    
    if not student:
        # Если студент не найден, возвращаем пустой ответ
        return None
    
    # Получаем всех студентов, отсортированных по баллам
    all_students = db.query(Student).order_by(desc(Student.study_score)).all()
    
    # Находим место студента
    position = 1
    for idx, s in enumerate(all_students, 1):
        if s.login == student.login:
            position = idx
            break
    
    full_name = f"{student.last_name} {student.first_name} {student.patronymic}".strip()
    score = float(student.study_score) if student.study_score is not None else 0.0
    
    return {
        "position": position,
        "firstName": student.first_name or user_info.get("first_name", ""),
        "lastName": student.last_name or user_info.get("last_name", ""),
        "fullName": full_name,
        "score": round(score, 1)
    }


@router.get("/api/top-weekly")
def get_top_weekly(
    db: Session = Depends(get_db)
):
    """Получает топ-3 студентов за неделю (по баллам, заработанным за неделю)"""
    # Получаем всех студентов, отсортированных по баллам
    all_students = db.query(Student).order_by(desc(Student.study_score)).limit(10).all()
    
    # Генерируем топ-3 на основе случайных данных (так как нет истории)
    # В реальном проекте здесь должна быть таблица истории баллов
    top_weekly = []
    
    for i, student in enumerate(all_students[:10]):  # Берем топ-10 и выбираем случайных
        if len(top_weekly) >= 3:
            break
        
        full_name = f"{student.last_name} {student.first_name} {student.patronymic}".strip()
        
        # Генерируем случайные данные для демонстрации
        points_gained = random.randint(15, 30)
        positions_gained = random.randint(3, 15)
        
        top_weekly.append({
            "name": full_name,
            "login": student.login,
            "pointsGained": points_gained,
            "positionsGained": positions_gained
        })
    
    return top_weekly[:3]


@router.get("/api/achievements")
def get_achievements(
    request: Request,
    db: Session = Depends(get_db)
):
    """Получает последние достижения"""
    achievements = []
    
    # Получаем текущего пользователя (может быть не авторизован)
    user_info = request.session.get("user_info")
    user_email = user_info.get("email", "") if user_info else ""
    
    # Генерируем тестовые достижения
    # В реальном проекте это должно быть из таблицы достижений
    
    if user_email:
        student = find_student_by_user_email(user_email, db)
        if student:
            full_name = f"{student.last_name} {student.first_name} {student.patronymic}".strip()
            
            achievements.append({
                "type": "position",
                "text": f"{student.first_name} {student.last_name} поднялся на 5 позиций.",
                "time": "2 часа назад"
            })
    
    # Добавляем общие достижения (даже если пользователь не авторизован)
    achievements.extend([
        {
            "type": "badge",
            "text": "Анна Смирнова получила значок \"Проектный гуру\".",
            "time": "вчера"
        },
        {
            "type": "streak",
            "text": "Дмитрий Соколов удерживает топ-10 уже 3 недели.",
            "time": "2 дня назад"
        }
    ])
    
    return achievements[:3]  # Возвращаем последние 3


# from fastapi import APIRouter, Query, Depends, HTTPException
# from sqlalchemy import asc, desc
# from sqlalchemy.orm import Session
# from database import SessionLocal
# from models import Student
# from schemas import StudentResponse
# from typing import List, Optional
# from starlette.requests import Request

# router = APIRouter()

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# def get_current_user(request: Request):
#     user = request.session.get('user')
#     if not user:
#         raise HTTPException(status_code=401, detail="Не авторизован")
#     return user

# @router.get("/api/leaderboard", response_model=List[StudentResponse])
# def get_leaderboard(
#     request: Request,
#     search: Optional[str] = Query(None),
#     school: Optional[str] = Query(None),
#     group: Optional[str] = Query(None),
#     min_score: Optional[float] = Query(None),
#     max_score: Optional[float] = Query(None),
#     sort_by: Optional[str] = Query(None),  # 'group', 'school', 'year', 'score'
#     sort_order: Optional[str] = Query("desc"),  # 'asc' или 'desc'
#     db: Session = Depends(get_db),
#     user: dict = Depends(get_current_user)
# ):
#     query = db.query(Student)

#     if search:
#         search_terms = search.split()  # <-- Разбиваем строку поиска
#         for term in search_terms:
#             term_pattern = f"%{term}%"
#             query = query.filter(
#                 (Student.first_name.ilike(term_pattern)) |
#                 (Student.last_name.ilike(term_pattern)) |
#                 (Student.patronymic.ilike(term_pattern)) |
#                 (Student.direction_name.ilike(term_pattern)) |
#                 (Student.student_group.ilike(term_pattern))
#             )

#     if school:
#         query = query.filter(Student.direction_name == school)

#     if group:
#         query = query.filter(Student.student_group == group)

#     if min_score is not None:
#         query = query.filter(Student.study_score >= min_score)

#     if max_score is not None:
#         query = query.filter(Student.study_score <= max_score)

#     # Определяем поле сортировки
#     order_field = None

#     if sort_by == "group":
#         order_field = Student.student_group
#     elif sort_by == "school":
#         order_field = Student.direction_name
#     elif sort_by == "year":
#         order_field = Student.study_year
#     elif sort_by == "score":
#         order_field = Student.study_score
#     else:
#         order_field = Student.study_score  # по умолчанию

#     # Применяем сортировку
#     if sort_order == "asc":
#         query = query.order_by(asc(order_field))
#     else:
#         query = query.order_by(desc(order_field))

#     students = query.all()

#     result = []
#     for idx, s in enumerate(students, 1):
#         full_name = f"{s.last_name} {s.first_name} {s.patronymic}".strip()
#         school = s.direction_name or s.faculty or "Не указано"
#         score = float(s.study_score) if s.study_score is not None else 0.0

#         result.append({
#             "Место": idx,
#             "ФИО": full_name,
#             "Школа": school,
#             "Группа": s.student_group,
#             "Счет баллов": score
#         })

#     return result