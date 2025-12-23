// App.jsx
import { useState, useEffect } from 'react';
import { Header } from './components/Header/Header';
import { Filters } from './components/Filters/Filters';
import { Table } from './components/Table/Table';
import { Sidebar } from './components/Sidebar/Sidebar';
import { AuthModal } from './components/AuthModal/AuthModal';
import { RatingSwitcher } from './components/RatingSwitcher/RatingSwitcher';
import axios from 'axios'; 
import { useAuth } from './hook/useAuth';
import api from './services/api';
import './App.css';

const API_BASE_URL = 'http://localhost:8000';

// axios.defaults.withCredentials = true; // Убрано: используем api.js с withCredentials

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

  // Данные для сайдбара
  const [userRank, setUserRank] = useState(null);
  const [topWeekly, setTopWeekly] = useState([]);
  const [achievements, setAchievements] = useState([]);

  const [ratingMode, setRatingMode] = useState('individual');
  const [teams, setTeams] = useState([]);
  const [mentors, setMentors] = useState([]);

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
      // Загружаем данные для сайдбара
      fetchSidebarData();
    }
  };

  const fetchTeams = async () => {
  const res = await fetch('/data/teams.json');
  setTeams(await res.json());
};

  const fetchMentors = async () => {
    const res = await fetch('/data/mentors.json');
    setMentors(await res.json());
  };

  useEffect(() => {
    if (ratingMode === 'team') fetchTeams();
    if (ratingMode === 'mentor') fetchMentors();
  }, [ratingMode]);



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

  // Загрузка данных для сайдбара
  const fetchSidebarData = async () => {
    try {
      // Загружаем место пользователя
      try {
        const rankResponse = await api.get('/api/user/rank');
        if (rankResponse.data) {
          setUserRank(rankResponse.data);
        } else {
          setUserRank(null);
        }
      } catch (err) {
        // Если пользователь не авторизован или не найден - это нормально
        if (err.response?.status !== 401) {
          console.error('Ошибка загрузки места пользователя:', err);
        }
        setUserRank(null);
      }

      // Загружаем топ-3 за неделю
      try {
        const weeklyResponse = await api.get('/api/top-weekly');
        setTopWeekly(weeklyResponse.data || []);
      } catch (err) {
        console.error('Ошибка загрузки топа недели:', err);
        setTopWeekly([]);
      }

      // Загружаем достижения (доступны даже для неавторизованных)
      try {
        const achievementsResponse = await axios.get(`${API_BASE_URL}/api/achievements`, {
          withCredentials: true
        });
        setAchievements(achievementsResponse.data || []);
      } catch (err) {
        console.error('Ошибка загрузки достижений:', err);
        setAchievements([]);
      }
    } catch (err) {
      console.error('Ошибка загрузки данных сайдбара:', err);
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
    fetchSidebarData();
  };

  // Эффект для начальной загрузки
  useEffect(() => {
    fetchStudents();
    fetchFilters();
    fetchSidebarData();
  }, []);

  // Эффект для загрузки данных сайдбара при изменении пользователя
  useEffect(() => {
    if (user) {
      fetchSidebarData();
    } else {
      setUserRank(null);
    }
  }, [user]);

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

      {/* Основной контент в двух колонках */}
      <div className="main-content">
        {/* Левая панель - фильтры и таблица */}
        <div className="main-panel">
          <h1 className="main-title">Общий рейтинг</h1>
          
          {/* Индикатор загрузки при обновлении данных */}
          {loading && students.length > 0 && (
            <div className="loading-overlay">
              <div className="spinner-small"></div>
              <span>Обновление данных...</span>
            </div>
          )}

          <RatingSwitcher mode={ratingMode} onChange={setRatingMode} />

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
            onApply={() => fetchStudents()}
          />
          
          <Table 
            students={students} 
            error={error} 
            currentUser={currentUser} 
            mode={ratingMode}
            teams={teams}
            mentors={mentors}
          />
        </div>

        
        {/* Правая панель - сайдбар */}
        <Sidebar 
          user={user}
          userRank={userRank}
          topWeekly={topWeekly}
          achievements={achievements}
        />
      </div>
    </div>
  );
}