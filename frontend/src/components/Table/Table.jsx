// Table.jsx
import "./Table.css";
import { useNavigate } from "react-router-dom";

export function Table({
  mode = "individual",   // 'individual' | 'team' | 'mentor'
  students = [],
  teams = [],
  mentors = [],
  error,
  currentUser
}) {
  const navigate = useNavigate();

  const handleNameClick = (login) => {
    if (!login) return;
    navigate(`/profile/${login}`);
  };

  if (error) {
    return (
      <div className="app-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  const data =
    mode === "individual"
      ? students
      : mode === "team"
      ? teams
      : mentors;

  return (
    <div className="app-container">
      <table className="film-table">
        <thead>
          <tr>
            <th>Место</th>

            {mode === "individual" && (
              <>
                <th>ФИО</th>
                <th>Школа</th>
                <th>Группа</th>
              </>
            )}

            {mode === "team" && <th>Команда</th>}
            {mode === "mentor" && <th>Наставник</th>}

            <th>Баллы</th>
          </tr>
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => {
              const place = item.Место || index + 1;

              let rowClass = "";
              if (place === 1) rowClass = "gold-row";
              else if (place === 2) rowClass = "silver-row";
              else if (place === 3) rowClass = "bronze-row";

              if (
                mode === "individual" &&
                item.login &&
                item.login === currentUser
              ) {
                rowClass += " current-user-row";
              }

              /** ✅ КОРРЕКТНОЕ ОПРЕДЕЛЕНИЕ БАЛЛОВ */
              let scoreValue = null;

              if (mode === "individual") {
                // ищем первое числовое поле (баллы всегда число)
                scoreValue =
                  Object.values(item).find(
                    (v) => typeof v === "number" && !Number.isNaN(v)
                  ) ?? "";
              } else {
                scoreValue = item.score ?? "";
              }


              return (
                <tr key={item.id || item.login || index} className={rowClass.trim()}>
                  <td>{place}</td>

                  {mode === "individual" && (
                    <>
                      <td>
                        {item.login ? (
                          <span
                            className="student-name-link"
                            onClick={() => handleNameClick(item.login)}
                            style={{
                              cursor: "pointer",
                              color: "#1a6b2d",
                              textDecoration: "underline"
                            }}
                          >
                            {item.ФИО}
                          </span>
                        ) : (
                          item.ФИО
                        )}
                      </td>
                      <td>{item.Школа}</td>
                      <td>{item.Группа}</td>
                    </>
                  )}

                  {mode === "team" && <td>{item.name}</td>}
                  {mode === "mentor" && <td>{item.fullName}</td>}

                  <td>{scoreValue}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={mode === "individual" ? 5 : 3}
                className="loading"
              >
                Нет данных
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
