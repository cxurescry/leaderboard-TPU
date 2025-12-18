from pydantic import BaseModel

class StudentResponse(BaseModel):
    Место: int
    ФИО: str
    Школа: str
    Группа: str
    Счет_баллов: float
    login: str = None

    class Config:
        from_attributes = True