import "./RatingSwitcher.css";

export function RatingSwitcher({ mode, onChange }) {
  return (
    <div className="rating-switcher">
      <button
        className={mode === 'individual' ? 'active' : ''}
        onClick={() => onChange('individual')}
      >
        Индивидуальный
      </button>

      <button
        className={mode === 'team' ? 'active' : ''}
        onClick={() => onChange('team')}
      >
        Командный
      </button>

      <button
        className={mode === 'mentor' ? 'active' : ''}
        onClick={() => onChange('mentor')}
      >
        Наставнический
      </button>
    </div>
  );
}
