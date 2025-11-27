// Filters.jsx
import "./Filters.css";
import { useState } from "react";

export function Filters({
  search,
  onSearchChange,
  schoolFilter,
  onSchoolFilterChange,
  groupFilter,
  onGroupFilterChange,
  minScore,
  onMinScoreChange,
  maxScore,
  onMaxScoreChange,
  schools,
  groups,
  onReset,
  visibleCount
}) {
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  return (
    <div className="filters-wrapper">
      {/* Флагок — всегда виден */}
      <div
        className="filters-toggle"
        onClick={() => setIsFiltersVisible(!isFiltersVisible)}
      >
        <span className="toggle-icon">🔍</span>
        <span>Фильтры и поиск</span>
      </div>

      {/* Полный контейнер фильтров — только если раскрыт */}
      {isFiltersVisible && (
        <div className="filters-container">
          <div className="filters-controls">
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Поиск по ФИО"
              className="filter-input"
            />

              <>
                <select
                  value={schoolFilter}
                  onChange={(e) => onSchoolFilterChange(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Все школы</option>
                  {schools.map((school) => (
                    <option key={school} value={school}>
                      {school}
                    </option>
                  ))}
                </select>

                <select
                  value={groupFilter}
                  onChange={(e) => onGroupFilterChange(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Все группы</option>
                  {groups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </>
            

            <div className="score-range">
              <label>Баллы:</label>
              <input
                type="number"
                min="0"
                max={300}
                value={minScore}
                onChange={(e) => onMinScoreChange(Number(e.target.value) || 0)}
                className="score-input"
              />
              <span>–</span>
              <input
                type="number"
                min="0"
                max="300"
                value={maxScore}
                onChange={(e) => onMaxScoreChange(Number(e.target.value))}
                className="score-input"
              />
            </div>

            <button onClick={onReset} className="reset-button">
              Сбросить
            </button>
          </div>

          <div className="filters-summary">
            Показано: <strong>{visibleCount}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
