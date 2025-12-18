import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Header } from '../Header/Header';
import { useAuth } from '../../hook/useAuth';
import './Profile.css';

const API_BASE_URL = 'http://localhost:8000';

export function Profile() {
  const { login } = useParams();
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/profile/${login}`, {
          withCredentials: true
        });
        setProfileData(response.data);
      } catch (err) {
        setError('Ошибка загрузки профиля: ' + (err.response?.data?.detail || err.message));
      } finally {
        setLoading(false);
      }
    };

    if (login) {
      fetchProfile();
    }
  }, [login]);

  const handleLogin = () => {
    // Логика входа, если нужно
  };

  if (loading) {
    return (
      <div className="app">
        <Header user={user} onLogin={handleLogin} onLogout={logout} />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <Header user={user} onLogin={handleLogin} onLogout={logout} />
        <div className="error-container">
          <div className="error-message">{error}</div>
          <Link to="/" className="back-link">← Назад к лидерборду</Link>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="app">
        <Header user={user} onLogin={handleLogin} onLogout={logout} />
        <div className="error-container">
          <div className="error-message">Профиль не найден</div>
          <Link to="/" className="back-link">← Назад к лидерборду</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="app profile-page">
      <Header user={user} onLogin={handleLogin} onLogout={logout} />
      
      <div className="profile-content">
        {/* Шапка профиля */}
        <div className="profile-header">
          <div className="profile-header-content">
            <div className="profile-avatar-section">
              <div className="role-badges">
                {profileData.roles && profileData.roles.map((role, index) => (
                  <span key={index} className="role-badge">{role}</span>
                ))}
              </div>
              <div className="avatar-container">
                <img 
                  src="/no-avatar.svg" 
                  alt={profileData.fullName}
                  className="profile-avatar"
                  onError={(e) => {
                    e.target.src = '/no-avatar.svg';
                  }}
                />
              </div>
            </div>
            <div className="profile-info-header">
              <h1 className="profile-name">{profileData.fullName}</h1>
              <div className="profile-meta">
                <span className="profile-login">@{profileData.login}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="profile-body">
          {/* Левая колонка */}
          <div className="profile-main-column">
            {/* Основная информация */}
            <div className="profile-section">
              <h2 className="section-title">Основная информация</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Школа:</span>
                  <span className="info-value">{profileData.school}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Направление:</span>
                  <span className="info-value">{profileData.direction}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Группа:</span>
                  <span className="info-value">{profileData.group}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Курс:</span>
                  <span className="info-value">{profileData.course}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Наличие долгов:</span>
                  <span className={`info-value ${profileData.debts > 0 ? 'has-debts' : 'no-debts'}`}>
                    {profileData.debts > 0 ? `Да (${profileData.debts})` : 'Нет'}
                  </span>
                </div>
              </div>
            </div>

            {/* Статистика и рейтинги */}
            <div className="profile-section">
              <h2 className="section-title">Статистика и рейтинги</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Проектов</div>
                  <div className="stat-value">{profileData.statistics?.projectsCount || 0}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Успеваемость</div>
                  <div className="stat-value">{profileData.statistics?.averagePerformance?.toFixed(2) || '0.00'}</div>
                  <div className="stat-subtitle">средний балл</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Часов работы</div>
                  <div className="stat-value">{profileData.statistics?.totalHours || 0}</div>
                </div>
                <div className="stat-card highlight">
                  <div className="stat-label">Место в рейтинге</div>
                  <div className="stat-value">#{profileData.statistics?.individualRank || '-'}</div>
                </div>
                {profileData.statistics?.teamRank && (
                  <>
                    <div className="stat-card">
                      <div className="stat-label">Место команды</div>
                      <div className="stat-value">#{profileData.statistics.teamRank}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-label">Вклад в команду</div>
                      <div className="stat-value">{profileData.statistics.teamContribution}%</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Команды и проекты */}
            <div className="profile-section">
              <h2 className="section-title">Команды и проекты</h2>
              <div className="projects-list">
                {profileData.projects && profileData.projects.length > 0 ? (
                  profileData.projects.map((project, index) => (
                    <div key={index} className="project-card">
                      <div className="project-header">
                        <h3 className="project-name">{project.name}</h3>
                        <span className={`project-status ${project.status === 'Текущий' ? 'current' : 'completed'}`}>
                          {project.status}
                        </span>
                      </div>
                      <div className="project-details">
                        <div className="project-detail">
                          <span className="detail-label">Команда:</span>
                          <Link to={project.team_link} className="team-link">{project.team}</Link>
                        </div>
                        <div className="project-detail">
                          <span className="detail-label">Время участия:</span>
                          <span>{project.participation_time}</span>
                        </div>
                        <div className="project-detail">
                          <span className="detail-label">Роль:</span>
                          <span>{project.role}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">Нет проектов</div>
                )}
              </div>
            </div>

            {/* Инфографика */}
            <div className="profile-section">
              <h2 className="section-title">Инфографика</h2>
              <div className="charts-container">
                <div className="chart-section">
                  <h3 className="chart-title">График часов по неделям</h3>
                  <div className="chart-wrapper">
                    <div className="simple-chart">
                      {profileData.charts?.weeklyHours?.map((item, index) => (
                        <div key={index} className="chart-bar-container">
                          <div 
                            className="chart-bar"
                            style={{ height: `${(item.hours / 40) * 100}%` }}
                            title={`Неделя ${index + 1}: ${item.hours} часов`}
                          ></div>
                          {(index + 1) % 5 === 0 && (
                            <span className="chart-label">{index + 1}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="chart-section">
                  <h3 className="chart-title">График успеваемости</h3>
                  <div className="chart-wrapper">
                    <div className="performance-chart">
                      {profileData.charts?.performance?.map((item, index) => (
                        <div key={index} className="performance-bar-container">
                          <div 
                            className="performance-bar"
                            style={{ height: `${(item.score / 5) * 100}%` }}
                            title={`Неделя ${index + 1}: ${item.score.toFixed(2)} баллов`}
                          ></div>
                          {(index + 1) % 5 === 0 && (
                            <span className="chart-label">{index + 1}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Правая колонка - доп. информация */}
          <div className="profile-sidebar">
            <div className="sidebar-section">
              <h3 className="sidebar-title">Рейтинг</h3>
              <div className="rating-display">
                <div className="rating-value">{profileData.statistics?.currentScore || 0}</div>
                <div className="rating-label">баллов</div>
                <div className="rating-position">Место: #{profileData.statistics?.individualRank || '-'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Кнопка возврата */}
        <div className="profile-footer">
          <Link to="/" className="back-link">← Назад к лидерборду</Link>
        </div>
      </div>
    </div>
  );
}
