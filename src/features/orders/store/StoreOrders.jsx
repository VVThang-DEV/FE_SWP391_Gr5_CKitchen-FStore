import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye } from "lucide-react";
import PageWrapper from "../../../components/layout/PageWrapper/PageWrapper";
import { Button, DataTable, Badge } from "../../../components/ui";
import { useAuth } from "../../../contexts/AuthContext";
import { useData } from "../../../contexts/DataContext";

export default function StoreOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    orders,
    STATUS_LABELS,
    STATUS_COLORS,
    formatCurrency,
    formatDateTime,
  } = useData();
  const [statusFilter, setStatusFilter] = useState("all");

  const storeOrders = orders.filter((o) => o.storeId === user.store);
  const filtered =
    statusFilter === "all"
      ? storeOrders
      : storeOrders.filter((o) => o.status === statusFilter);

  const columns = [
    {
      header: "Ma don",
      accessor: "id",
      sortable: true,
      width: "100px",
      render: (row) => (
        <span
          className="font-mono"
          style={{ fontWeight: 600, color: "var(--primary)" }}
        >
          {row.id}
        </span>
      ),
    },
    {
      header: "San pham",
      accessor: "items",
      render: (row) => (
        <div>
          {row.items.map((item, i) => (
            <div key={i} style={{ fontSize: "13px" }}>
              {item.productName} x {item.quantity}
            </div>
          ))}
        </div>
      ),
    },
    { header: "Ngay yeu cau", accessor: "requestedDate", sortable: true },
    {
      header: "Tong tien",
      accessor: "total",
      sortable: true,
      render: (row) => (
        <span className="font-mono">{formatCurrency(row.total)}</span>
      ),
    },
    {
      header: "Trang thai",
      accessor: "status",
      sortable: true,
      render: (row) => (
        <Badge variant={STATUS_COLORS[row.status]} dot>
          {STATUS_LABELS[row.status]}
        </Badge>
      ),
    },
    {
      header: "Tao luc",
      accessor: "createdAt",
      render: (row) => formatDateTime(row.createdAt),
    },
    {
      header: "",
      accessor: "actions",
      width: "60px",
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          icon={Eye}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/store/orders/${row.id}`);
          }}
          title="Xem chi tiet"
        />
      ),
    },
  ];

  const statusTabs = [
    { value: "all", label: "Tat ca" },
    { value: "pending", label: "Cho xu ly" },
    { value: "confirmed", label: "Da xac nhan" },
    { value: "producing", label: "Dang SX" },
    { value: "shipping", label: "Dang giao" },
    { value: "delivered", label: "Da giao" },
  ];

  return (
    <PageWrapper
      title="Don dat hang"
      subtitle="Quan ly don dat hang nguyen lieu tu bep trung tam"
      actions={
        <Button icon={Plus} onClick={() => navigate("/store/orders/new")}>
          Tao don moi
        </Button>
      }
    >
      {/* Status filter tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            style={{
              padding: "6px 16px",
              borderRadius: "var(--radius-full)",
              border: "1.5px solid",
              borderColor:
                statusFilter === tab.value
                  ? "var(--primary)"
                  : "var(--surface-border)",
              background:
                statusFilter === tab.value
                  ? "var(--primary-bg)"
                  : "var(--surface-card)",
              color:
                statusFilter === tab.value
                  ? "var(--primary)"
                  : "var(--text-secondary)",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 200ms ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Tim theo ma don, san pham..."
        emptyTitle="Chua co don hang"
        emptyDesc="Bam 'Tao don moi' de bat dau dat hang tu bep trung tam."
      />
    </PageWrapper>
  );
}
