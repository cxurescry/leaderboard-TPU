// Filters.jsx
import "./Filters.css";

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
  visibleCount,
  onApply
}) {
  const handleApply = () => {
    if (onApply) {
      onApply();
    }
  };

  return (
    <div className="filters-wrapper-new">
      <div className="filters-row">
        <select
          value={schoolFilter}
          onChange={(e) => onSchoolFilterChange(e.target.value)}
          className="filter-select-new"
        >
          <option value="">Все институты</option>
          {schools.map((school) => (
            <option key={school} value={school}>
              {school}
            </option>
          ))}
        </select>

        <select
          value={groupFilter}
          onChange={(e) => onGroupFilterChange(e.target.value)}
          className="filter-select-new"
        >
          <option value="">Все группы</option>
          {groups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>

        <button onClick={handleApply} className="apply-button">
          <span className="apply-icon">🔍</span>
          Применить
        </button>
      </div>
    </div>
  );
}