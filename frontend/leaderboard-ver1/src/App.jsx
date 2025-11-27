import { useState, useEffect } from 'react';
import { Header } from './components/Header/Header';
import { Filters } from './components/Filters/Filters';
import { Table } from './components/Table/Table';
import { AuthModal } from './components/AuthModal/AuthModal';
import axios from 'axios';
import { useAuth } from './hook/useAuth';
import './App.css';

const API_BASE_URL = 'http://localhost:8000';

export default function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(300);
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState('desc');

  const [schools, setSchools] = useState([]);
  const [groups, setGroups] = useState([]);

  // Используем хук авторизации
  const { user, loading: authLoading, loginWithData, logout, checkAuth } = useAuth();

  const handleLogin = () => {
    setIsAuthModalOpen(true);
  };

  const handleAuthSubmit = async (userData) => {
    const success = await loginWithData(userData);
    if (success) {
      setIsAuthModalOpen(false);
      // Обновляем данные после авторизации
      checkAuth();
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const trimmedSearch = search.trim();
      const response = await axios.get(`${API_BASE_URL}/api/leaderboard`, {
        params: {
          search: trimmedSearch,
          school: schoolFilter,
          group: groupFilter,
          min_score: minScore,
          max_score: maxScore,
          sort_by: sortBy,
          sort_order: sortOrder
        }
      });
      setStudents(response.data);
    } catch (err) {
      setError('Ошибка загрузки данных: ' + (err.response?.data?.detail || err.message || 'Неизвестная ошибка'));
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/leaderboard`, {
        params: { min_score: 0, max_score: 300 }
      });
      const data = response.data;

      const uniqueSchools = [...new Set(data.map(s => s.Школа).filter(Boolean))];
      const uniqueGroups = [...new Set(data.map(s => s.Группа).filter(Boolean))];

      setSchools(uniqueSchools);
      setGroups(uniqueGroups);
    } catch (err) {
      console.error('Ошибка загрузки фильтров:', err);
    }
  };

  // Находим текущего пользователя в таблице
  const findCurrentUserInLeaderboard = () => {
    if (!user || students.length === 0) return null;

    // Несколько стратегий поиска пользователя в таблице
    const userInTable = students.find(student => {
      // 1. По точному совпадению email
      if (student.email && student.email === user.email) return true;
      
      // 2. По логину (часть email до @)
      const userLoginFromEmail = user.email?.split('@')[0];
      if (student.login && student.login === userLoginFromEmail) return true;
      
      // 3. По ФИО (если данные есть в обоих местах)
      if (student.ФИО && user.first_name && user.last_name) {
        const studentName = student.ФИО.toLowerCase();
        const userName = `${user.first_name} ${user.last_name}`.toLowerCase();
        if (studentName.includes(userName)) return true;
      }
      
      // 4. По ID ТПУ (если есть в данных)
      if (student.tpu_user_id && student.tpu_user_id === user.tpu_user_id) return true;
      
      return false;
    });
    
    return userInTable?.login || null;
  };

  // Обработчик для ручного обновления данных
  const handleRefresh = () => {
    fetchStudents();
    fetchFilters();
  };

  // Эффект для начальной загрузки
  useEffect(() => {
    fetchStudents();
    fetchFilters();
  }, []);

  // Эффект для фильтрации и сортировки
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchStudents();
    }, 300); // Дебаунс 300ms

    return () => clearTimeout(timeoutId);
  }, [search, schoolFilter, groupFilter, minScore, maxScore, sortBy, sortOrder]);

  const onReset = () => {
    setSearch('');
    setSchoolFilter('');
    setGroupFilter('');
    setMinScore(0);
    setMaxScore(300);
    setSortBy('score');
    setSortOrder('desc');
  };

  const currentUser = findCurrentUserInLeaderboard();

  // Показываем индикатор загрузки при первоначальной загрузке
  if (loading && students.length === 0) {
    return (
      <div className="app">
        <Header user={user} onLogin={handleLogin} onLogout={logout} />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Загрузка данных лидерборда...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header 
        user={user}
        onLogin={handleLogin}
        onLogout={logout}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleAuthSubmit}
      />
      
      {/* Информация о авторизации */}
      {user && (
        <div className="auth-info">
          <div className="auth-content">
            <span className="auth-icon">🧪</span>
            <div className="auth-text">
              <strong>Тестовый режим</strong>
              <br />
              Вы вошли как: <strong>{user.first_name} {user.last_name}</strong>
              <br />
              <small>{user.email}</small>
              {currentUser && (
                <div className="user-position">
                  Логин в системе: <code>{currentUser}</code>
                </div>
              )}
            </div>
            <button onClick={handleRefresh} className="refresh-btn" title="Обновить данные">
              🔄
            </button>
          </div>
          <div className="test-notice">
            Для реальной авторизации получите ключи на 
            <a href="https://api.tpu.ru/dashboard" target="_blank" rel="noopener noreferrer">
              api.tpu.ru
            </a>
          </div>
        </div>
      )}

      {/* Подсказка для неавторизованных */}
      {!user && (
        <div className="auth-hint">
          <p>🎯 <strong>Тестовая авторизация</strong> - нажмите "Войти" для демонстрации</p>
          <p><small>Для реальной авторизации ТПУ потребуются ключи с api.tpu.ru</small></p>
          <button onClick={handleRefresh} className="refresh-btn-large">
            🔄 Обновить данные
          </button>
        </div>
      )}

      {/* Индикатор загрузки при обновлении данных */}
      {loading && students.length > 0 && (
        <div className="loading-overlay">
          <div className="spinner-small"></div>
          <span>Обновление данных...</span>
        </div>
      )}

      <Filters
        search={search}
        onSearchChange={setSearch}
        schoolFilter={schoolFilter}
        onSchoolFilterChange={setSchoolFilter}
        groupFilter={groupFilter}
        onGroupFilterChange={setGroupFilter}
        minScore={minScore}
        onMinScoreChange={setMinScore}
        maxScore={maxScore}
        onMaxScoreChange={setMaxScore}
        schools={schools}
        groups={groups}
        onReset={onReset}
        visibleCount={students.length}
        loading={loading}
      />
      
      <Table 
        students={students} 
        error={error} 
        currentUser={currentUser} 
        loading={loading}
      />

      {/* Статистика в футере */}
      <footer className="app-footer">
        <div className="footer-stats">
          <span>Всего студентов: <strong>{students.length}</strong></span>
          {currentUser && <span>• Ваше место будет выделено зеленым</span>}
          {user && <span>• Авторизованы через тестовый режим</span>}
        </div>
        <div className="footer-info">
          Лидерборд Томский политехнический университет © 2024
        </div>
      </footer>
    </div>
  );
}