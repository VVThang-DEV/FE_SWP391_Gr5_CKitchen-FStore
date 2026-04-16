import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, User, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth, ROLE_INFO } from '../../contexts/AuthContext';
import Logo from '../../components/ui/Logo/Logo';
import './LoginPage.css';

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    try {
      const user = await login(username.trim(), password);
      const roleInfo = ROLE_INFO[user.role];
      const defaultPath = user.role === 'store_staff'
        ? '/store/orders/new'
        : (roleInfo ? roleInfo.path + '/dashboard' : '/admin/dashboard');
      navigate(defaultPath);
    } catch {
      // Error is already set in AuthContext
    }
  };

  const handleInputChange = (setter) => (e) => {
    if (error) clearError();
    setter(e.target.value);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__brand">
          <Logo size={48} className="login-card__logo-img" />
          <h1 className="login-card__brand-name">CKitchen</h1>
        </div>
        <p className="login-card__subtitle">
          Hệ thống Quản lý Bếp Trung Tâm & Cửa hàng Franchise
        </p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* Error Alert */}
          {error && (
            <div className="login-form__error" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Username Field */}
          <div className="login-form__field">
            <label htmlFor="login-username" className="login-form__label">
              Tên đăng nhập
            </label>
            <div className="login-form__input-wrapper">
              <User size={18} className="login-form__input-icon" />
              <input
                id="login-username"
                type="text"
                className="login-form__input"
                placeholder="Nhập tên đăng nhập hoặc email"
                value={username}
                onChange={handleInputChange(setUsername)}
                disabled={isLoading}
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="login-form__field">
            <label htmlFor="login-password" className="login-form__label">
              Mật khẩu
            </label>
            <div className="login-form__input-wrapper">
              <Lock size={18} className="login-form__input-icon" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="login-form__input login-form__input--password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={handleInputChange(setPassword)}
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-form__toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="login-form__submit"
            disabled={isLoading || !username.trim() || !password.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="login-form__spinner" />
                Đang đăng nhập...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Đăng nhập
              </>
            )}
          </button>
        </form>

        <div className="login-card__footer">
          CKitchen Management System v1.0
        </div>
      </div>
    </div>
  );
}
