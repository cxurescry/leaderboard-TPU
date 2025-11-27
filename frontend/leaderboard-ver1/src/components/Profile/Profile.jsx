import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export function Profile() {
  const { login } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/profile/${login}`);
        setStudent(response.data);
      } catch (err) {
        setError('Ошибка загрузки профиля: ' + err.response?.data?.detail || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (login) {
      fetchProfile();
    }
  }, [login]);

  if (loading) return <div>Загрузка профиля...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="profile-container">
      <h1>Личный кабинет</h1>
      <div className="profile-info">
        <p><strong>Логин:</strong> {login}</p>
        <p><strong>ФИО:</strong> {student?.ФИО}</p>
        <p><strong>Школа:</strong> {student?.Школа}</p>
        <p><strong>Группа:</strong> {student?.Группа}</p>
        <p><strong>Баллы:</strong> {student?.["Счет баллов"]}</p>
      </div>
      <a href="/">← Назад к лидерборду</a>
    </div>
  );
}