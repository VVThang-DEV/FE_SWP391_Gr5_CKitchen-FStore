import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import authService from "../../services/authService";
import { User, Lock, Contact, CheckCircle } from "lucide-react";
import Logo from "../../components/ui/Logo/Logo";
import "./LoginPage.css"; // Reuse premium styles

export default function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });

  const [loading, setLoading] = useState(false);
  
  const email = searchParams.get("email");
  const otp = searchParams.get("otp");

  useEffect(() => {
    if (!email || !otp) {
      toast.error("Đường dẫn kích hoạt không hợp lệ.");
      navigate("/login");
    }
  }, [email, otp, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      setLoading(true);
      await authService.activateAccount({
        email,
        otp,
        username: form.username,
        password: form.password,
        confirmPassword: form.confirmPassword,
        fullName: form.fullName,
      });
      toast.success("Kích hoạt tài khoản thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Kích hoạt thất bại. Vui lòng kiểm tra lại liên kết.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: '500px' }}>
        <div className="login-card__brand">
          <Logo size={40} className="login-card__logo-img" />
          <h1 className="login-card__brand-name" style={{ fontSize: '1.5rem', marginTop: '10px' }}>Kích Hoạt Tài Khoản</h1>
        </div>
        <p className="login-card__subtitle" style={{ marginBottom: '30px' }}>
          Hoàn tất thông tin đăng nhập cho email <br/>
          <strong style={{ color: 'var(--primary)' }}>{email}</strong>
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label htmlFor="fullName">Họ và tên</label>
            <div className="input-wrapper">
              <Contact size={18} className="input-icon" />
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Nhập họ và tên"
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Nhập tên đăng nhập"
                value={form.username}
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
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Xác nhận mật khẩu"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading} style={{ marginTop: '20px' }}>
            {loading ? "Đang kích hoạt..." : "Hoàn tất kích hoạt"}
            {!loading && <CheckCircle size={18} />}
          </button>
        </form>

        <div className="login-card__footer">
          Bản quyền thuộc về CKitchen &copy; 2024
        </div>
      </div>
    </div>
  );
}
