import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import authService from "../../services/authService";
import { Mail, Lock, CheckCircle, ArrowLeft, KeyRound } from "lucide-react";
import Logo from "../../components/ui/Logo/Logo";
import "./LoginPage.css"; 

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!email.trim()) {
      toast.error("Vui lòng nhập email hợp lệ!");
      return;
    }

    try {
      setLoading(true);
      await authService.forgotPassword(email);
      toast.success("Mã OTP đã được gửi đến email của bạn!");
      setStep(2);
      setCountdown(60);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Không thể gửi OTP. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!form.otp || form.otp.length !== 6) {
      toast.error("Vui lòng nhập đủ 6 số mã OTP!");
      return;
    }

    try {
      setLoading(true);
      await authService.verifyForgotPasswordOtp(email, form.otp);
      toast.success("Xác thực OTP thành công! Vui lòng nhập mật khẩu mới.");
      setStep(3);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Mã OTP không hợp lệ hoặc đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword({
        email,
        otp: form.otp,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      toast.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Đặt lại mật khẩu thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: "450px" }}>
        <div className="login-card__brand">
          <Logo size={40} className="login-card__logo-img" />
          <h1 className="login-card__brand-name" style={{ fontSize: "1.5rem", marginTop: "10px" }}>
            Quên Mật Khẩu
          </h1>
        </div>

        {step === 1 && (
          <>
            <p className="login-card__subtitle" style={{ marginBottom: "20px" }}>
              Nhập email đã đăng ký của bạn để nhận mã xác thực đặt lại mật khẩu.
            </p>
            <form className="login-form" onSubmit={handleSendOtp}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Nhập địa chỉ email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="login-submit-btn" disabled={loading} style={{ marginTop: "20px" }}>
                {loading ? "Đang gửi..." : "Nhận mã xác thực OTP"}
                {!loading && <KeyRound size={18} />}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <p className="login-card__subtitle" style={{ marginBottom: "20px" }}>
              Mã OTP đã được gửi đến <strong>{email}</strong>
            </p>
            <form className="login-form" onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label htmlFor="otp">Mã Xác Thực (OTP)</label>
                <div className="input-wrapper">
                  <CheckCircle size={18} className="input-icon" />
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    placeholder="Nhập 6 số OTP"
                    value={form.otp}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="login-submit-btn" disabled={loading} style={{ marginTop: "20px" }}>
                {loading ? "Đang xác thực..." : "Xác Thực Mã OTP"}
                {!loading && <CheckCircle size={18} />}
              </button>

              <div style={{ textAlign: "center", marginTop: "15px" }}>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={countdown > 0 || loading}
                  style={{
                    background: "none",
                    border: "none",
                    color: countdown > 0 ? "var(--text-muted)" : "var(--primary)",
                    cursor: countdown > 0 ? "not-allowed" : "pointer",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    textDecoration: countdown > 0 ? "none" : "underline"
                  }}
                >
                  {countdown > 0 ? `Gửi lại mã sau ${countdown}s` : "Gửi lại mã OTP"}
                </button>
              </div>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <p className="login-card__subtitle" style={{ marginBottom: "20px" }}>
              Nhập mật khẩu mới cho tài khoản <strong>{email}</strong>
            </p>
            <form className="login-form" onSubmit={handleResetPassword}>
              <div className="form-group">
                <label htmlFor="newPassword">Mật khẩu mới</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    placeholder="Nhập mật khẩu mới"
                    value={form.newPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Nhập lại mật khẩu mới"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="login-submit-btn" disabled={loading} style={{ marginTop: "20px" }}>
                {loading ? "Đang xử lý..." : "Đặt Lại Mật Khẩu"}
                {!loading && <CheckCircle size={18} />}
              </button>
            </form>
          </>
        )}

        <div className="login-divider">
          <span>Trở về</span>
        </div>

        <div className="social-login">
          <Link to="/login" style={{ textDecoration: "none", width: "100%" }}>
            <button type="button" className="social-btn">
              <ArrowLeft size={18} />
              <span>Quay lại trang Đăng nhập</span>
            </button>
          </Link>
        </div>

        <div className="login-card__footer">
          Bản quyền thuộc về CKitchen &copy; 2024
        </div>
      </div>
    </div>
  );
}
