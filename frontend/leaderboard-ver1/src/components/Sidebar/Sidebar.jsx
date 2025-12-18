import "./Sidebar.css";

function getScoreLabel(score) {
  const lastDigit = Math.floor(score) % 10;
  const lastTwoDigits = Math.floor(score) % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return "баллов";
  }
  if (lastDigit === 1) {
    return "балл";
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return "балла";
  }
  return "баллов";
}

export function Sidebar({ user, userRank, topWeekly, achievements }) {
  return (
    <div className="sidebar">
      {/* Место пользователя в рейтинге */}
      {user && userRank && (
        <div className="sidebar-section user-rank-card">
          <h3 className="sidebar-title">Твоё место в рейтинге</h3>
          <div className="rank-card">
            <div className="rank-number">{userRank.position}</div>
            <div className="rank-info">
              <div className="rank-name">
                {userRank.firstName} {userRank.lastName}
              </div>
              <div className="rank-score">
                {userRank.score.toFixed(1)} {getScoreLabel(userRank.score)}
              </div>
            </div>
            <div className="rank-icon">🏆</div>
          </div>
        </div>
      )}

      {/* Топ-3 студентов недели */}
      <div className="sidebar-section">
        <h3 className="sidebar-title">Топ-3 студентов недели</h3>
        <div className="top-weekly-list">
          {topWeekly && topWeekly.length > 0 ? (
            topWeekly.map((student, index) => (
              <div key={index} className="top-weekly-item">
                <div className="weekly-avatar">
                  <img src="/no-avatar.svg" alt={student.name} />
                </div>
                <div className="weekly-info">
                  <div className="weekly-name">{student.name}</div>
                  <div className="weekly-stats">
                    <span className="weekly-points">+{student.pointsGained} баллов</span>
                    <span className="weekly-positions">+{student.positionsGained} позиций</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">Нет данных за неделю</div>
          )}
        </div>
      </div>

      {/* Последние достижения */}
      <div className="sidebar-section">
        <h3 className="sidebar-title">Последние достижения</h3>
        <div className="achievements-list">
          {achievements && achievements.length > 0 ? (
            achievements.map((achievement, index) => (
              <div key={index} className="achievement-item">
                <div className={`achievement-icon achievement-${achievement.type}`}>
                  {achievement.type === 'position' && '⬆️'}
                  {achievement.type === 'badge' && '🎖️'}
                  {achievement.type === 'streak' && '🏆'}
                </div>
                <div className="achievement-content">
                  <div className="achievement-text">{achievement.text}</div>
                  <div className="achievement-time">{achievement.time}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">Нет достижений</div>
          )}
        </div>
      </div>
    </div>
  );
}
