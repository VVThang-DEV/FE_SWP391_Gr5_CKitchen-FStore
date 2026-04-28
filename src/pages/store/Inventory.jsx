import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import PageWrapper from "../../components/layout/PageWrapper/PageWrapper";
import { DataTable, Badge } from "../../components/ui";
import { useData } from "../../contexts/DataContext";
import storeService from "../../services/storeService";

export default function StoreInventory() {
  const { formatDate, formatCurrency, isExpiringSoon, isExpired } = useData();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const resp = await storeService.getStoreInventory({ size: 100 });
        setData(resp.content || []);
      } catch (err) {
        toast.error("Không thể tải tồn kho");
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const columns = [
    { header: "Sản phẩm", accessor: "productName", sortable: true },
    {
      header: "Mã SP",
      accessor: "productId",
      width: "80px",
      render: (r) => (
        <span className="font-mono" style={{ fontSize: "12px" }}>
          {r.productId}
        </span>
      ),
    },
    {
      header: "Giá bán",
      accessor: "price",
      render: (r) => (
        <span className="font-mono">{formatCurrency(r.price ?? 0)}</span>
      ),
    },
    {
      header: "Tồn kho",
      accessor: "quantity",
      sortable: true,
      render: (row) => {
        const isLow = row.lowStock || row.quantity === 0;
        return (
          <span
            style={{
              fontWeight: 600,
              color: isLow
                ? "var(--danger)"
                : row.quantity === 0
                  ? "var(--danger)"
                  : "var(--text-primary)",
            }}
          >
            {row.quantity} {row.unit}
          </span>
        );
      },
    },
    {
      header: "Mức tối thiểu",
      accessor: "minStock",
      render: (r) => `${r.minStock} ${r.unit}`,
    },
    {
      header: "Hạn sử dụng",
      accessor: "expiryDate",
      sortable: true,
      render: (row) => {
        if (!row.expiryDate)
          return <span style={{ color: "var(--text-muted)" }}>—</span>;
        const expired = isExpired(row.expiryDate);
        const expiring = isExpiringSoon(row.expiryDate);
        return (
          <span
            style={{
              color: expired
                ? "var(--danger)"
                : expiring
                  ? "var(--warning)"
                  : "var(--text-primary)",
            }}
          >
            {formatDate(row.expiryDate)}
          </span>
        );
      },
    },
    {
      header: "Trạng thái",
      render: (row) => {
        if (isExpired(row.expiryDate) && row.quantity > 0)
          return (
            <Badge variant="danger" dot>
              Hết hạn
            </Badge>
          );
        if (row.quantity === 0)
          return (
            <Badge variant="danger" dot>
              Hết hàng
            </Badge>
          );
        if (row.lowStock)
          return (
            <Badge variant="warning" dot>
              Sắp hết
            </Badge>
          );
        return (
          <Badge variant="success" dot>
            Đủ hàng
          </Badge>
        );
      },
    },
    {
      header: "Cập nhật",
      accessor: "updatedAt",
      render: (r) => (
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          {r.updatedAt ? formatDate(r.updatedAt) : "—"}
        </span>
      ),
    },
  ];

  const expiredCount = data.filter(
    (i) => i.expiryDate && isExpired(i.expiryDate) && i.quantity > 0,
  ).length;

  return (
    <PageWrapper
      title="Tồn kho cửa hàng"
      subtitle="Theo dõi số lượng tồn kho và hạn sử dụng tại cửa hàng"
    >
      {expiredCount > 0 && (
        <div
          style={{
            padding: "12px 16px",
            background: "var(--danger-bg, #fef2f2)",
            border: "1px solid var(--danger)",
            borderRadius: "var(--radius-md)",
            marginBottom: "16px",
            fontSize: "14px",
            color: "var(--danger)",
            fontWeight: 600,
          }}
        >
          {expiredCount} sản phẩm hết hạn cần xử lý. Vui lòng hủy bỏ các sản
          phẩm hết hạn.
        </div>
      )}

      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Tìm sản phẩm..."
        emptyTitle="Chưa có dữ liệu tồn kho"
      />
    </PageWrapper>
  );
}
