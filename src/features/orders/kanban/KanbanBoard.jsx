import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MapPin, Calendar, User, FileText, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import PageWrapper from "../../../components/layout/PageWrapper/PageWrapper";
import { Badge, Drawer } from "../../../components/ui";
import { useData } from "../../../contexts/DataContext";
import "./KanbanBoard.css";

const COLUMNS = [
  { id: "pending", label: "Cho xu ly" },
  { id: "confirmed", label: "Da xac nhan" },
  { id: "producing", label: "Dang san xuat" },
  { id: "ready", label: "San sang giao" },
  { id: "shipping", label: "Dang giao" },
];

const STATUS_ORDER = ["pending", "confirmed", "producing", "ready", "shipping"];

function OrderCard({ order, isDragging, onClick, formatCurrency, formatDate }) {
  const handleClick = (e) => {
    if (!isDragging && onClick) {
      onClick(order);
    }
  };

  return (
    <div
      className={`order-card ${isDragging ? "order-card--dragging" : ""}`}
      onClick={handleClick}
    >
      <div className="order-card__header">
        <span className="order-card__id">{order.id}</span>
        <span
          className={`order-card__priority order-card__priority--${order.priority}`}
        >
          {order.priority === "high"
            ? "Gap"
            : order.priority === "normal"
              ? "Binh thuong"
              : "Thap"}
        </span>
      </div>
      <div className="order-card__store">{order.storeName}</div>
      <div className="order-card__items">
        {order.items.map((item, i) => (
          <div key={i}>
            {item.productName} x {item.quantity}
          </div>
        ))}
      </div>
      <div className="order-card__footer">
        <span>{formatDate(order.requestedDate)}</span>
        <span className="order-card__total">{formatCurrency(order.total)}</span>
      </div>
      <div className="order-card__view-hint">
        Xem chi tiet <ChevronRight size={12} />
      </div>
    </div>
  );
}

function SortableOrderCard({ order, onCardClick, formatCurrency, formatDate }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: order.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <OrderCard order={order} isDragging={isDragging} onClick={onCardClick} formatCurrency={formatCurrency} formatDate={formatDate} />
    </div>
  );
}

function OrderDetailDrawer({ order, isOpen, onClose, STATUS_LABELS, STATUS_COLORS, formatCurrency, formatDate, formatDateTime }) {
  if (!order) return null;

  const currentStepIndex = STATUS_ORDER.indexOf(order.status);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Chi tiet don hang ${order.id}`}
    >
      <div className="order-drawer">
        <div className="order-drawer__status">
          <Badge variant={STATUS_COLORS[order.status]} dot>
            {STATUS_LABELS[order.status]}
          </Badge>
          {order.priority === "high" && (
            <Badge variant="danger">Uu tien cao</Badge>
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
          <h4 className="order-drawer__section-title">Thong tin don hang</h4>
          <div className="order-drawer__info-grid">
            <div className="order-drawer__info-item">
              <FileText size={14} />
              <div>
                <span className="order-drawer__info-label">Ma don</span>
                <span className="order-drawer__info-value font-mono">
                  {order.id}
                </span>
              </div>
            </div>
            <div className="order-drawer__info-item">
              <MapPin size={14} />
              <div>
                <span className="order-drawer__info-label">Cua hang</span>
                <span className="order-drawer__info-value">
                  {order.storeName}
                </span>
              </div>
            </div>
            <div className="order-drawer__info-item">
              <Calendar size={14} />
              <div>
                <span className="order-drawer__info-label">
                  Ngay yeu cau giao
                </span>
                <span className="order-drawer__info-value">
                  {formatDate(order.requestedDate)}
                </span>
              </div>
            </div>
            <div className="order-drawer__info-item">
              <User size={14} />
              <div>
                <span className="order-drawer__info-label">Nguoi tao</span>
                <span className="order-drawer__info-value">
                  {order.createdBy}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="order-drawer__section">
          <h4 className="order-drawer__section-title">San pham dat hang</h4>
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
              <span>Tong cong</span>
              <span className="font-mono">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {order.notes && (
          <div className="order-drawer__section">
            <h4 className="order-drawer__section-title">Ghi chu</h4>
            <p className="order-drawer__notes">{order.notes}</p>
          </div>
        )}

        <div className="order-drawer__meta">
          Tao boi {order.createdBy} — {formatDateTime(order.createdAt)}
        </div>
      </div>
    </Drawer>
  );
}

export default function KanbanBoard({
  title = "Bang quan ly don hang",
  subtitle,
}) {
  const { orders, updateOrder, STATUS_LABELS, STATUS_COLORS, formatCurrency, formatDate, formatDateTime } = useData();

  const activeOrders = orders.filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled",
  );

  const [activeId, setActiveId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dragged, setDragged] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const getOrdersByStatus = (status) =>
    activeOrders.filter((o) => o.status === status);

  const findOrderById = (id) => activeOrders.find((o) => o.id === id);

  const handleCardClick = (order) => {
    if (!dragged) {
      setSelectedOrder(order);
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    setDragged(true);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    setTimeout(() => setDragged(false), 100);

    if (!over) return;

    const activeOrder = findOrderById(active.id);
    if (!activeOrder) return;

    const overColumn = COLUMNS.find((col) => col.id === over.id);
    const overOrder = findOrderById(over.id);

    let targetStatus;
    if (overColumn) {
      targetStatus = overColumn.id;
    } else if (overOrder) {
      targetStatus = overOrder.status;
    }

    if (targetStatus && activeOrder.status !== targetStatus) {
      const fromLabel = STATUS_LABELS[activeOrder.status];
      const toLabel = STATUS_LABELS[targetStatus];

      updateOrder(active.id, { status: targetStatus });

      toast.success(`${activeOrder.id}: ${fromLabel} -> ${toLabel}`, {
        duration: 3000,
      });
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeOrder = findOrderById(active.id);
    if (!activeOrder) return;

    const overColumn = COLUMNS.find((col) => col.id === over.id);
    const overOrder = findOrderById(over.id);

    let targetStatus;
    if (overColumn) {
      targetStatus = overColumn.id;
    } else if (overOrder) {
      targetStatus = overOrder.status;
    }

    if (targetStatus && activeOrder.status !== targetStatus) {
      updateOrder(active.id, { status: targetStatus });
    }
  };

  const activeOrder = activeId ? findOrderById(activeId) : null;

  const currentSelectedOrder = selectedOrder
    ? activeOrders.find((o) => o.id === selectedOrder.id)
    : null;

  return (
    <PageWrapper title={title} subtitle={subtitle}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban">
          {COLUMNS.map((col) => {
            const columnOrders = getOrdersByStatus(col.id);
            return (
              <div key={col.id} className="kanban-column">
                <div className="kanban-column__header">
                  <div className="kanban-column__title">
                    <span
                      className={`kanban-column__dot kanban-column__dot--${col.id}`}
                    />
                    {col.label}
                  </div>
                  <span className="kanban-column__count">
                    {columnOrders.length}
                  </span>
                </div>
                <SortableContext
                  id={col.id}
                  items={columnOrders.map((o) => o.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="kanban-column__body">
                    {columnOrders.map((order) => (
                      <SortableOrderCard
                        key={order.id}
                        order={order}
                        onCardClick={handleCardClick}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeOrder ? <OrderCard order={activeOrder} isDragging formatCurrency={formatCurrency} formatDate={formatDate} /> : null}
        </DragOverlay>
      </DndContext>

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
    </PageWrapper>
  );
}
