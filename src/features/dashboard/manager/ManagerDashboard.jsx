import {
  DollarSign,
  ShoppingCart,
  Store,
  TrendingUp,
  Percent,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import PageWrapper from "../../../components/layout/PageWrapper/PageWrapper";
import { StatCard } from "../../../components/ui";
import { useAuth } from "../../../contexts/AuthContext";
import { useData } from "../../../contexts/DataContext";
import "../Dashboard.css";

export default function ManagerDashboard() {
  const { user } = useAuth();
  const {
    dashboardStats,
    revenueData,
    categoryDistribution,
    formatCurrency,
    ordersByStore,
  } = useData();
  const stats = dashboardStats.manager;

  return (
    <PageWrapper>
      <div
        className="welcome-banner"
        style={{ background: "linear-gradient(135deg, #1D3557, #457B9D)" }}
      >
        <p className="welcome-banner__greeting">Báo cáo tổng quan,</p>
        <h2 className="welcome-banner__name">{user?.name} 📊</h2>
        <p className="welcome-banner__summary">
          Doanh thu tháng này đạt {formatCurrency(stats.totalRevenue)} với{" "}
          {stats.totalOrders} đơn hàng. Tỷ lệ hoàn thành {stats.avgFulfillment}
          %.
        </p>
      </div>

      <div className="dashboard-stats">
        <StatCard
          label="Tổng doanh thu"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          color="primary"
          trend="up"
          trendValue="+15% so với tháng trước"
        />
        <StatCard
          label="Tổng đơn hàng"
          value={stats.totalOrders}
          icon={ShoppingCart}
          color="info"
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          label="Cửa hàng hoạt động"
          value={stats.activeStores}
          icon={Store}
          color="accent"
        />
        <StatCard
          label="Tỷ lệ hao hụt"
          value={`${stats.wastageRate}%`}
          icon={Percent}
          color="warning"
          trend="down"
          trendValue="-0.5%"
        />
      </div>

      <div
        className="dashboard-grid--equal"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-5)",
          marginBottom: "var(--space-6)",
        }}
      >
        <div className="dashboard-section">
          <div className="dashboard-section__header">
            <h3 className="dashboard-section__title">Doanh thu theo tháng</h3>
          </div>
          <div className="dashboard-section__body">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--surface-border)"
                />
                <XAxis
                  dataKey="month"
                  fontSize={12}
                  tick={{ fill: "var(--text-secondary)" }}
                />
                <YAxis
                  fontSize={12}
                  tick={{ fill: "var(--text-secondary)" }}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-card)",
                    border: "1px solid var(--surface-border)",
                    borderRadius: "10px",
                    fontSize: "13px",
                  }}
                  formatter={(v) => formatCurrency(v)}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Doanh thu"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "var(--primary)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section__header">
            <h3 className="dashboard-section__title">Phân bổ theo danh mục</h3>
          </div>
          <div className="dashboard-section__body">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`}
                  labelLine={false}
                >
                  {categoryDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-card)",
                    border: "1px solid var(--surface-border)",
                    borderRadius: "10px",
                    fontSize: "13px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section__header">
          <h3 className="dashboard-section__title">Hiệu suất theo cửa hàng</h3>
        </div>
        <div className="dashboard-section__body">
          <ResponsiveContainer width="100%" height={280}>
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
              <YAxis
                yAxisId="left"
                fontSize={12}
                tick={{ fill: "var(--text-secondary)" }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                fontSize={12}
                tick={{ fill: "var(--text-secondary)" }}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--surface-card)",
                  border: "1px solid var(--surface-border)",
                  borderRadius: "10px",
                  fontSize: "13px",
                }}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="orders"
                name="Số đơn"
                fill="var(--primary)"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="revenue"
                name="Doanh thu"
                fill="var(--accent-light)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PageWrapper>
  );
}
