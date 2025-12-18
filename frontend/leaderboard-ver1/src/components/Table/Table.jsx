import "./Table.css";
import { useNavigate } from 'react-router-dom';

export function Table({ students, error, currentUser }) {
  const navigate = useNavigate();

  const handleNameClick = (login) => {
    navigate(`/profile/${login}`);
  };

  if (error) {
    return (
      <div className="app-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <title>Лидерборд</title>

      <table className="film-table">
        <thead>
          <tr>
            <th>Место</th>
            <th>ФИО</th>
            <th>Школа</th>
            <th>Группа</th>
            <th>Баллы</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((student, index) => {
              // Определяем классы для призовых мест
              let rowClass = "";
              const place = student.Место || index + 1;
              
              if (place === 1) {
                rowClass = "gold-row";
              } else if (place === 2) {
                rowClass = "silver-row";
              } else if (place === 3) {
                rowClass = "bronze-row";
              }

              // Добавляем класс для текущего пользователя
              if (student.login === currentUser) {
                rowClass += " current-user-row";
              }

              const studentLogin = student.login || student.Место || `student-${index}`;
              
              return (
                <tr 
                  key={studentLogin} 
                  className={rowClass.trim()}
                >
                  <td>{place}</td>
                  <td>
                    {studentLogin ? (
                      <span 
                        className="student-name-link"
                        onClick={() => handleNameClick(studentLogin)}
                        style={{ cursor: 'pointer', color: '#1a6b2d', textDecoration: 'underline' }}
                      >
                        {student.ФИО}
                      </span>
                    ) : (
                      <span>{student.ФИО}</span>
                    )}
                  </td>
                  <td>{student.Школа}</td>
                  <td>{student.Группа}</td>
                  <td>{student["Счет_баллов"] || student.Баллы}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td className="loading" colSpan="5">
                Загрузка данных...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}