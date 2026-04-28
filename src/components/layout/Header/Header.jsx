import { useLocation, Link } from "react-router-dom";
import {
  ChevronRight,
  ShoppingCart,
  Menu,
  Moon,
  Sun,
} from "lucide-react";
import { useAuth, ROLE_INFO } from "../../../contexts/AuthContext";
import { useTheme } from "../../../contexts/ThemeContext";
import "./Header.css";

const ROUTE_LABELS = {
  store: "Cửa hàng",
  kitchen: "Bếp trung tâm",
  supply: "Điều phối",
  manager: "Quản lý",
  admin: "Quản trị",
  dashboard: "Tổng quan",
  orders: "Đơn hàng",
  new: "Tạo mới",
  inventory: "Tồn kho",
  receiving: "Nhận hàng",
  production: "Sản xuất",
  batches: "Lô sản xuất",
  "product-batches": "Lô thành phẩm",
  "ingredient-batches": "Lô nguyên liệu",
  delivery: "Giao hàng",
  issues: "Vấn đề phát sinh",
  products: "Sản phẩm",
  recipes: "Công thức",
  sales: "Ghi nhận bán hàng",
  reports: "Báo cáo",
  performance: "Hiệu suất",
  users: "Người dùng",
  stores: "Cửa hàng & Bếp",
  kitchens: "Bếp Trung Tâm",
  config: "Cấu hình",
  "activity-logs": "Nhật ký hoạt động",
};



export default function Header() {
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean);

  const { user } = useAuth();
  const { theme, toggleTheme, toggleSidebar } = useTheme();

  const cart = [];
  const rolePrefix = user ? ROLE_INFO[user.role]?.path || "" : "";

  const breadcrumbs = parts.map((part, i) => ({
    label: ROUTE_LABELS[part] || part,
    path: "/" + parts.slice(0, i + 1).join("/"),
    isLast: i === parts.length - 1,
  }));

  return (
    <header className="app-header">
      <div className="app-header__left">
        <button
          className="app-header__menu-btn"
          onClick={toggleSidebar}
          aria-label="Mở menu"
        >
          <Menu size={20} />
        </button>
        <nav className="app-header__breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span
              key={i}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              {i > 0 && (
                <ChevronRight
                  size={14}
                  className="app-header__breadcrumb-sep"
                />
              )}
              {crumb.isLast ? (
                <span className="app-header__breadcrumb-current">
                  {crumb.label}
                </span>
              ) : (
                <Link to={crumb.path}>{crumb.label}</Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="app-header__right">
        {/* Cart Icon — Only for Store Staff */}
        {user?.role === "STORE_STAFF" && (
          <Link
            to="/store/orders/new"
            className="app-header__icon-btn"
            aria-label="Giỏ hàng"
          >
            <ShoppingCart size={20} />
            {cart.length > 0 && (
              <span className="app-header__notif-dot">{cart.length}</span>
            )}
          </Link>
        )}

        {/* Theme Toggle */}
        <button
          className="app-header__icon-btn"
          onClick={toggleTheme}
          aria-label="Đổi chủ đề"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>


      </div>
    </header>
  );
}
