import { useState } from 'react';
import './AuthModal.css';

export function AuthModal({ isOpen, onClose, onLogin }) {
  const [formData, setFormData] = useState({
    first_name: 'Иван',
    last_name: 'Иванов',
    email: 'student@tpu.ru',
    tpu_user_id: '12345'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(formData);
    onClose();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const loadPreset = (preset) => {
    setFormData(preset);
  };

  const presets = [
    {
      name: 'Студент 1',
      data: {
        first_name: 'Иван',
        last_name: 'Иванов',
        email: 'ivanov@tpu.ru',
        tpu_user_id: '1001'
      }
    },
    {
      name: 'Студент 2', 
      data: {
        first_name: 'Мария',
        last_name: 'Петрова',
        email: 'petrova@tpu.ru',
        tpu_user_id: '1002'
      }
    },
    {
      name: 'Студент 3',
      data: {
        first_name: 'Алексей',
        last_name: 'Сидоров',
        email: 'sidorov@tpu.ru',
        tpu_user_id: '1003'
      }
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Тестовая авторизация</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            Выберите готовый профиль или введите свои данные для тестирования
          </p>

          {/* Готовые пресеты */}
          <div className="presets-section">
            <h3>Готовые профили:</h3>
            <div className="presets-grid">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  className="preset-btn"
                  onClick={() => loadPreset(preset.data)}
                >
                  <div className="preset-name">{preset.name}</div>
                  <div className="preset-details">
                    {preset.data.first_name} {preset.data.last_name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Форма ввода */}
          <form onSubmit={handleSubmit} className="auth-form">
            <h3>Или введите свои данные:</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Имя:</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Фамилия:</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>ID ТПУ:</label>
              <input
                type="text"
                name="tpu_user_id"
                value={formData.tpu_user_id}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={onClose} className="btn-secondary">
                Отмена
              </button>
              <button type="submit" className="btn-primary">
                Войти
              </button>
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <p className="footer-note">
            Это тестовая авторизация. Для реального входа через ТПУ потребуются ключи API.
          </p>
        </div>
      </div>
    </div>
  );
}