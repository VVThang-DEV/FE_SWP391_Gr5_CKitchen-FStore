import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock, LogIn } from "lucide-react";
import { useAuth, ROLES, ROLE_INFO } from "../../contexts/AuthContext";
import Logo from "../../components/ui/Logo/Logo";
import "./LoginPage.css";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      setError("Vui lòng nhập tên đăng nhập.");
      return;
    }
    if (!formData.password) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const user = await login(formData.username, formData.password);
      const rolePath = ROLE_INFO[user.role]?.path || "/admin";
      navigate(rolePath + "/dashboard");
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setError("Tên đăng nhập hoặc mật khẩu không đúng.");
      } else if (status >= 500) {
        setError("Lỗi máy chủ. Vui lòng thử lại sau.");
      } else {
        setError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__brand">
          <Logo size={40} className="login-card__logo-img" />
          <h1 className="login-card__brand-name">CKitchen</h1>
        </div>
        <p className="login-card__subtitle">
          Hệ thống Quản lý Bếp Trung Tâm & Cửa hàng Franchise
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "4px",
              }}
            >
              <Link
                to="/forgot-password"
                style={{
                  fontSize: "0.875rem",
                  color: "var(--primary)",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            {!isLoading && <LogIn size={18} />}
          </button>
        </form>

        <div className="login-card__footer">
          Bản quyền thuộc về CKitchen &copy; 2024
        </div>
      </div>
    </div>
  );
}
