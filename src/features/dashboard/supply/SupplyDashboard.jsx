import { ClipboardList, Truck, AlertTriangle, Calendar } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import PageWrapper from "../../../components/layout/PageWrapper/PageWrapper";
import { StatCard } from "../../../components/ui";
import { useAuth } from "../../../contexts/AuthContext";
import { useData } from "../../../contexts/DataContext";
import "../Dashboard.css";

export default function SupplyDashboard() {
  const { user } = useAuth();
  const { dashboardStats, recentActivity, ordersByStore, issues } = useData();
  const stats = dashboardStats.supply;
  const openIssues = issues.filter((i) => i.status !== "resolved");

  return (
    <PageWrapper>
      <div
        className="welcome-banner"
        style={{ background: "linear-gradient(135deg, #D97706, #F59E0B)" }}
      >
        <p className="welcome-banner__greeting">Xin chào,</p>
        <h2 className="welcome-banner__name">{user?.name} 📋</h2>
        <p className="welcome-banner__summary">
          Có {stats.totalPending} đơn chờ phân phối và {openIssues.length} vấn
          đề cần giải quyết.
        </p>
      </div>

      <div className="dashboard-stats">
        <StatCard
          label="Đơn chờ phân phối"
          value={stats.totalPending}
          icon={ClipboardList}
          color="warning"
        />
        <StatCard
          label="Đang vận chuyển"
          value={stats.totalInTransit}
          icon={Truck}
          color="info"
        />
        <StatCard
          label="Vấn đề phát sinh"
          value={stats.openIssues}
          icon={AlertTriangle}
          color="accent"
        />
        <StatCard
          label="Giao hàng hôm nay"
          value={stats.deliveriesToday}
          icon={Calendar}
          color="primary"
        />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="dashboard-section__header">
            <h3 className="dashboard-section__title">Đơn hàng theo cửa hàng</h3>
          </div>
          <div className="dashboard-section__body">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ordersByStore}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--surface-border)"
                />
                <XAxis
                  dataKey="name"
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
                  dataKey="orders"
                  name="Số đơn"
                  fill="var(--warning)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section__header">
            <h3 className="dashboard-section__title">🚨 Vấn đề cần xử lý</h3>
          </div>
          <div className="dashboard-section__body--flush">
            {openIssues.map((issue) => (
              <div key={issue.id} className="activity-item">
                <div
                  className={`activity-item__icon activity-item__icon--${issue.priority === "high" ? "warning" : "delivery"}`}
                >
                  <AlertTriangle size={16} />
                </div>
                <div className="activity-item__content">
                  <p className="activity-item__message">{issue.title}</p>
                  <p className="activity-item__time">{issue.description}</p>
                </div>
              </div>
            ))}
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
                  className={`activity-item__icon activity-item__icon--delivery`}
                >
                  <Truck size={16} />
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
