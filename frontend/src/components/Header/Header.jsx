import "./Header.css";
import "./reset.css";

export function Header({ user, onLogin, onLogout }) {
  const handleLogoClick = () => {
    window.location.href = '/';
  };

  const handleUserClick = () => {
    if (user) {
      // Если пользователь авторизован - показываем меню или ничего
      console.log('User is logged in');
    } else {
      // Если не авторизован - вызываем функцию входа
      onLogin();
    }
  };

  const handleLogout = (e) => {
    e.stopPropagation(); // Останавливаем всплытие, чтобы не сработал handleUserClick
    onLogout();
  };

  return (
    <>
      <header>
        <div className="content">
          {/* Логотип "ЛИДЕРБОРД" */}
          <div id="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <img src="tpu-logo-liderboard.svg" height="100%" alt="Лидерборд" />
          </div>

          {/* Блок пользователя */}
          <div 
            id="user" 
            onClick={handleUserClick}
            style={{ cursor: 'pointer' }}
            className={user ? 'user-authorized' : 'user-unauthorized'}
            title={user ? `${user.first_name} ${user.last_name}` : 'Войти'}
          >
            <span>
              {user ? `${user.first_name} ${user.last_name}` : 'Войти'}
            </span>
            <img src="no-avatar.svg" height="100%" alt="Аватар" />
            
            {/* Выпадающее меню для авторизованных пользователей */}
            {user && (
              <div className="user-dropdown">
                <div className="dropdown-item" onClick={handleLogout}>
                  Выйти
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}