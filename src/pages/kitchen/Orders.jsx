import { useState } from "react";
import {
  MapPin,
  Calendar,
  User,
  FileText,
  ChevronRight,
  AlertTriangle,
  Eye,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import PageWrapper from "../../components/layout/PageWrapper/PageWrapper";
import {
  Badge,
  Drawer,
  Modal,
  Button,
  DataTable,
} from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import "./Orders.css";

const STATUS_ORDER = ["pending", "confirmed", "producing", "ready"];

const PRIORITY_MAP = {
  high: { label: "Gấp", variant: "danger" },
  normal: { label: "Bình thường", variant: "info" },
  low: { label: "Thấp", variant: "neutral" },
};

const statusTabs = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xử lý" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "producing", label: "Đang sản xuất" },
  { value: "ready", label: "Sẵn sàng giao" },
];

function OrderDetailDrawer({
  order,
  isOpen,
  onClose,
  STATUS_LABELS,
  STATUS_COLORS,
  formatCurrency,
  formatDate,
  formatDateTime,
}) {
  if (!order) return null;

  const currentStepIndex = STATUS_ORDER.indexOf(order.status);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Chi tiết đơn hàng ${order.id}`}
    >
      <div className="order-drawer">
        <div className="order-drawer__status">
          <Badge variant={STATUS_COLORS[order.status]} dot>
            {STATUS_LABELS[order.status]}
          </Badge>
          {order.priority === "high" && (
            <Badge variant="danger">Ưu tiên cao</Badge>
          )}
        </div>

        <div className="order-drawer__timeline">
          {STATUS_ORDER.map((s, i) => (
            <div
              key={s}
              className={`order-drawer__step ${i <= currentStepIndex ? "order-drawer__step--done" : ""} ${i === currentStepIndex ? "order-drawer__step--current" : ""}`}
            >
              <div className="order-drawer__step-dot" />
              <span className="order-drawer__step-label">
                {STATUS_LABELS[s]}
              </span>
              {i < STATUS_ORDER.length - 1 && (
                <div
                  className={`order-drawer__step-line ${i < currentStepIndex ? "order-drawer__step-line--filled" : ""}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="order-drawer__section">
          <h4 className="order-drawer__section-title">Thông tin đơn hàng</h4>
          <div className="order-drawer__info-grid">
            <div className="order-drawer__info-item">
              <FileText size={14} />
              <div>
                <span className="order-drawer__info-label">Mã đơn</span>
                <span className="order-drawer__info-value font-mono">
                  {order.id}
                </span>
              </div>
            </div>
            <div className="order-drawer__info-item">
              <MapPin size={14} />
              <div>
                <span className="order-drawer__info-label">Cửa hàng</span>
                <span className="order-drawer__info-value">
                  {order.storeName}
                </span>
              </div>
            </div>
            <div className="order-drawer__info-item">
              <Calendar size={14} />
              <div>
                <span className="order-drawer__info-label">
                  Ngày yêu cầu giao
                </span>
                <span className="order-drawer__info-value">
                  {formatDate(order.requestedDate)}
                </span>
              </div>
            </div>
            <div className="order-drawer__info-item">
              <User size={14} />
              <div>
                <span className="order-drawer__info-label">Người tạo</span>
                <span className="order-drawer__info-value">
                  {order.createdBy}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="order-drawer__section">
          <h4 className="order-drawer__section-title">Sản phẩm đặt hàng</h4>
          <div className="order-drawer__items">
            {order.items.map((item, i) => (
              <div key={i} className="order-drawer__item-row">
                <span>{item.productName}</span>
                <span className="font-mono">
                  {item.quantity} {item.unit}
                </span>
              </div>
            ))}
            <div className="order-drawer__item-total">
              <span>Tổng cộng</span>
              <span className="font-mono">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {order.notes && (
          <div className="order-drawer__section">
            <h4 className="order-drawer__section-title">Ghi chú</h4>
            <p className="order-drawer__notes">{order.notes}</p>
          </div>
        )}

        <div className="order-drawer__meta">
          Tạo bởi {order.createdBy} — {formatDateTime(order.createdAt)}
        </div>
      </div>
    </Drawer>
  );
}

export default function KitchenOrders({
  title = "Quản lý đơn hàng",
  subtitle,
}) {
  const { user } = useAuth();
  const {
    orders,
    updateOrder,
    batches,
    addBatch,
    updateBatch,
    recipes,
    kitchenInventory,
    updateKitchenInventory,
    addAuditLog,
    STATUS_LABELS,
    STATUS_COLORS,
    formatCurrency,
    formatDate,
    formatDateTime,
  } = useData();

  const activeOrders = orders.filter(
    (o) =>
      o.status !== "delivered" &&
      o.status !== "cancelled" &&
      o.status !== "shipping",
  );

  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pendingChange, setPendingChange] = useState(null);

  const filteredOrders =
    statusFilter === "all"
      ? activeOrders
      : activeOrders.filter((o) => o.status === statusFilter);

  const getCountForStatus = (status) => {
    if (status === "all") return activeOrders.length;
    return activeOrders.filter((o) => o.status === status).length;
  };

  // ---- Business logic (unchanged) ----

  const createBatchesForOrder = (order) => {
    if (batches.some((b) => b.orderId === order.id)) return;

    const maxBatchNum = batches.reduce((max, b) => {
      const match = b.id.match(/LO-SX-(\d+)/);
      return match ? Math.max(max, parseInt(match[1])) : max;
    }, 0);

    order.items.forEach((item, index) => {
      addBatch({
        id: `LO-SX-${String(maxBatchNum + 1 + index).padStart(3, "0")}`,
        orderId: order.id,
        orderItemIndex: index,
        planId: null,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unit: item.unit,
        status: "confirmed",
        startDate: null,
        endDate: null,
        staff: null,
      });
    });

    addAuditLog(
      "batch_created",
      user.name,
      `Tạo ${order.items.length} lô SX từ đơn ${order.id}`,
      "production",
    );
    toast.success(
      `Đã tạo ${order.items.length} lô sản xuất từ đơn ${order.id}`,
    );
  };

  const updateBatchesForOrder = (orderId, newOrderStatus) => {
    const orderBatches = batches.filter((b) => b.orderId === orderId);

    if (newOrderStatus === "producing") {
      orderBatches.forEach((b) => {
        updateBatch(b.id, {
          status: "in_progress",
          startDate: new Date().toISOString(),
        });
      });
    } else if (newOrderStatus === "ready") {
      orderBatches.forEach((b) => {
        updateBatch(b.id, {
          status: "completed",
          endDate: new Date().toISOString(),
        });

        const recipe = recipes.find((r) => r.productId === b.productId);
        if (recipe) {
          recipe.ingredients.forEach((ri) => {
            const inv = kitchenInventory.find(
              (i) => i.ingredientId === ri.ingredientId,
            );
            if (inv) {
              const deduction = ri.quantity * b.quantity;
              updateKitchenInventory(inv.id, {
                quantity: Math.max(
                  0,
                  Math.round((inv.quantity - deduction) * 100) / 100,
                ),
              });
            }
          });
        }
      });

      addAuditLog(
        "production_completed",
        user.name,
        `Hoàn thành SX đơn ${orderId} - NL đã trừ kho tự động`,
        "production",
      );
    }
  };

  // ---- Status advance ----

  const handleAdvanceStatus = (e, order) => {
    e.stopPropagation();
    const fromIndex = STATUS_ORDER.indexOf(order.status);
    const toStatus = STATUS_ORDER[fromIndex + 1];
    if (!toStatus) return;

    setPendingChange({
      orderId: order.id,
      orderLabel: order.id,
      storeName: order.storeName,
      fromStatus: order.status,
      toStatus,
    });
  };

  const handleConfirmChange = () => {
    if (!pendingChange) return;
    const { orderId, orderLabel, fromStatus, toStatus } = pendingChange;
    const fromLabel = STATUS_LABELS[fromStatus];
    const toLabel = STATUS_LABELS[toStatus];

    updateOrder(orderId, { status: toStatus });

    if (fromStatus === "pending" && toStatus === "confirmed") {
      const order = orders.find((o) => o.id === orderId);
      if (order) createBatchesForOrder(order);
    } else if (toStatus === "producing") {
      updateBatchesForOrder(orderId, "producing");
    } else if (toStatus === "ready") {
      updateBatchesForOrder(orderId, "ready");
    }

    toast.success(`${orderLabel}: ${fromLabel} ➜ ${toLabel}`, {
      duration: 3000,
    });
    setPendingChange(null);
  };

  const handleCancelChange = () => {
    setPendingChange(null);
  };

  // ---- Table columns ----

  const columns = [
    {
      header: "Mã đơn",
      accessor: "id",
      sortable: true,
      width: "120px",
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
      header: "Cửa hàng",
      accessor: "storeName",
      sortable: true,
    },
    {
      header: "Sản phẩm",
      accessor: "items",
      render: (row) => {
        const names = row.items.map((i) => `${i.productName} x${i.quantity}`);
        const display = names.join(", ");
        return (
          <span
            title={display}
            style={{
              maxWidth: 200,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "inline-block",
            }}
          >
            {display}
          </span>
        );
      },
    },
    {
      header: "Ưu tiên",
      accessor: "priority",
      sortable: true,
      width: "110px",
      render: (row) => {
        const p = PRIORITY_MAP[row.priority] || PRIORITY_MAP.normal;
        return (
          <Badge variant={p.variant} dot>
            {p.label}
          </Badge>
        );
      },
    },
    {
      header: "Ngày yêu cầu",
      accessor: "requestedDate",
      sortable: true,
      width: "130px",
      render: (row) => formatDate(row.requestedDate),
    },
    {
      header: "Tổng tiền",
      accessor: "total",
      sortable: true,
      width: "130px",
      render: (row) => (
        <span className="font-mono">{formatCurrency(row.total)}</span>
      ),
    },
    {
      header: "Trạng thái",
      accessor: "status",
      sortable: true,
      width: "140px",
      render: (row) => (
        <Badge variant={STATUS_COLORS[row.status]} dot>
          {STATUS_LABELS[row.status]}
        </Badge>
      ),
    },
    {
      header: "Thao tác",
      accessor: "actions",
      width: "180px",
      render: (row) => {
        const currentIndex = STATUS_ORDER.indexOf(row.status);
        const canAdvance = currentIndex < STATUS_ORDER.length - 1;
        const nextLabel = canAdvance
          ? STATUS_LABELS[STATUS_ORDER[currentIndex + 1]]
          : null;

        return (
          <div style={{ display: "flex", gap: "4px" }}>
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              icon={Eye}
              title="Xem chi tiết"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedOrder(row);
              }}
            />
            {canAdvance && (
              <Button
                variant="primary"
                size="sm"
                icon={ArrowRight}
                onClick={(e) => handleAdvanceStatus(e, row)}
                title={`Chuyển sang: ${nextLabel}`}
              >
                {nextLabel}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const currentSelectedOrder = selectedOrder
    ? orders.find((o) => o.id === selectedOrder.id)
    : null;

  return (
    <PageWrapper title={title} subtitle={subtitle}>
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
            {tab.label} ({getCountForStatus(tab.value)})
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredOrders}
        searchPlaceholder="Tìm theo mã đơn, cửa hàng..."
        onRowClick={(row) => setSelectedOrder(row)}
        emptyTitle="Không có đơn hàng"
        emptyDesc="Chưa có đơn hàng nào ở trạng thái này."
      />

      <OrderDetailDrawer
        order={currentSelectedOrder}
        isOpen={!!currentSelectedOrder}
        onClose={() => setSelectedOrder(null)}
        STATUS_LABELS={STATUS_LABELS}
        STATUS_COLORS={STATUS_COLORS}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        formatDateTime={formatDateTime}
      />

      <Modal
        isOpen={!!pendingChange}
        onClose={handleCancelChange}
        title="Xác nhận chuyển trạng thái"
        footer={
          <div className="order-confirm__actions">
            <Button variant="ghost" onClick={handleCancelChange}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleConfirmChange}>
              Xác nhận
            </Button>
          </div>
        }
      >
        {pendingChange && (
          <div className="order-confirm">
            <div className="order-confirm__icon">
              <AlertTriangle size={32} />
            </div>
            <p className="order-confirm__message">
              Bạn có chắc chắn muốn chuyển đơn hàng{" "}
              <strong>{pendingChange.orderLabel}</strong> (
              {pendingChange.storeName})
            </p>
            <div className="order-confirm__status-flow">
              <Badge variant={STATUS_COLORS[pendingChange.fromStatus]} dot>
                {STATUS_LABELS[pendingChange.fromStatus]}
              </Badge>
              <ChevronRight size={20} className="order-confirm__arrow" />
              <Badge variant={STATUS_COLORS[pendingChange.toStatus]} dot>
                {STATUS_LABELS[pendingChange.toStatus]}
              </Badge>
            </div>
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
}
