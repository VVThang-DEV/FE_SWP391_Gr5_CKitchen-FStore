import {
  ClipboardList,
  ChefHat,
  Package,
  Truck,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import PageWrapper from "../../components/layout/PageWrapper/PageWrapper";
import { StatCard } from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import "../Dashboard.css";

export default function KitchenDashboard() {
  const { user } = useAuth();
  const { dashboardStats, recentActivity, weeklyOrders, kitchenInventory } =
    useData();
  const stats = dashboardStats.kitchen;
  const lowStock = kitchenInventory.filter((i) => i.quantity <= i.minStock);

  return (
    <PageWrapper>
      <div
        className="welcome-banner"
        style={{ background: "linear-gradient(135deg, #9B2335, #E76F51)" }}
      >
        <p className="welcome-banner__greeting">Xin chào,</p>
        <h2 className="welcome-banner__name">{user?.name} 🍳</h2>
        <p className="welcome-banner__summary">
          Có {stats.pendingOrders} đơn cần xử lý và {lowStock.length} nguyên
          liệu dưới mức tối thiểu.
        </p>
      </div>

      <div className="dashboard-stats">
        <StatCard
          label="Đơn chờ xử lý"
          value={stats.pendingOrders}
          icon={ClipboardList}
          color="warning"
        />
        <StatCard
          label="Đang sản xuất"
          value={stats.producingOrders}
          icon={ChefHat}
          color="accent"
        />
        <StatCard
          label="Sẵn sàng giao"
          value={stats.readyToShip}
          icon={Truck}
          color="primary"
        />
        <StatCard
          label="Sản lượng hôm nay"
          value={`${stats.todayOutput} phần`}
          icon={Package}
          color="info"
          trend="up"
          trendValue="+8%"
        />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="dashboard-section__header">
            <h3 className="dashboard-section__title">Sản lượng theo ngày</h3>
          </div>
          <div className="dashboard-section__body">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weeklyOrders}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--surface-border)"
                />
                <XAxis
                  dataKey="day"
                  fontSize={12}
                  tick={{ fill: "var(--text-secondary)" }}
                />
                <YAxis fontSize={12} tick={{ fill: "var(--text-secondary)" }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-card)",
                    border: "1px solid var(--surface-border)",
                    borderRadius: "10px",
                    fontSize: "13px",
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Sản lượng"
                  fill="var(--accent)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section__header">
            <h3 className="dashboard-section__title">
              ⚠️ Nguyên liệu cần bổ sung
            </h3>
          </div>
          <div className="dashboard-section__body--flush">
            {lowStock.map((item) => (
              <div key={item.id} className="activity-item">
                <div className="activity-item__icon activity-item__icon--warning">
                  <AlertCircle size={16} />
                </div>
                <div className="activity-item__content">
                  <p className="activity-item__message">{item.name}</p>
                  <p className="activity-item__time">
                    Còn {item.quantity} {item.unit} / tối thiểu {item.minStock}
                  </p>
                </div>
              </div>
            ))}
            {lowStock.length === 0 && (
              <div className="activity-item">
                <div className="activity-item__content">
                  <p
                    className="activity-item__message"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Tất cả nguyên liệu đủ hàng ✓
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section__header">
          <h3 className="dashboard-section__title">Hoạt động gần đây</h3>
        </div>
        <div className="dashboard-section__body--flush">
          <div className="activity-feed">
            {recentActivity.slice(0, 5).map((act) => (
              <div key={act.id} className="activity-item">
                <div
                  className={`activity-item__icon activity-item__icon--${act.type.includes("production") ? "production" : "order"}`}
                >
                  <ChefHat size={16} />
                </div>
                <div className="activity-item__content">
                  <p className="activity-item__message">{act.message}</p>
                  <p className="activity-item__time">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
