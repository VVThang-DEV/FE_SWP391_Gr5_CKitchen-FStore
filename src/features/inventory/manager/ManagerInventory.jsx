import PageWrapper from "../../../components/layout/PageWrapper/PageWrapper";
import { DataTable, Badge } from "../../../components/ui";
import { useData } from "../../../contexts/DataContext";

export default function ManagerInventory() {
  const {
    storeInventory,
    kitchenInventory,
    stores,
    formatDate,
    isExpiringSoon,
    isExpired,
  } = useData();

  // Enrich store inventory with store name
  const enrichedStoreInv = storeInventory.map((item) => {
    const store = stores.find((s) => s.id === item.storeId);
    return { ...item, storeName: store ? store.name : item.storeId };
  });

  const storeColumns = [
    {
      header: "Cua hang",
      accessor: "storeName",
      sortable: true,
    },
    { header: "San pham", accessor: "productName", sortable: true },
    {
      header: "Ton kho",
      accessor: "quantity",
      sortable: true,
      render: (row) => {
        const isLow = row.quantity <= row.minStock;
        return (
          <span
            style={{
              fontWeight: 600,
              color: isLow ? "var(--danger)" : "var(--text-primary)",
            }}
          >
            {row.quantity} {row.unit}
          </span>
        );
      },
    },
    {
      header: "Muc toi thieu",
      accessor: "minStock",
      render: (r) => `${r.minStock} ${r.unit}`,
    },
    {
      header: "Han su dung",
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
      header: "Trang thai",
      accessor: "status",
      render: (row) => {
        if (row.quantity === 0)
          return (
            <Badge variant="danger" dot>
              Het hang
            </Badge>
          );
        if (row.quantity <= row.minStock)
          return (
            <Badge variant="warning" dot>
              Sap het
            </Badge>
          );
        return (
          <Badge variant="success" dot>
            Du hang
          </Badge>
        );
      },
    },
  ];

  const kitchenColumns = [
    { header: "Nguyen lieu", accessor: "name", sortable: true },
    {
      header: "Lo",
      accessor: "batchNo",
      render: (r) => (
        <span className="font-mono" style={{ fontSize: "12px" }}>
          {r.batchNo}
        </span>
      ),
    },
    { header: "Nha cung cap", accessor: "supplier" },
    {
      header: "Ton kho",
      accessor: "quantity",
      sortable: true,
      render: (row) => {
        const isLow = row.quantity <= row.minStock;
        return (
          <span
            style={{
              fontWeight: 600,
              color: isLow ? "var(--danger)" : "var(--text-primary)",
            }}
          >
            {row.quantity} {row.unit}
          </span>
        );
      },
    },
    {
      header: "Toi thieu",
      accessor: "minStock",
      render: (r) => `${r.minStock} ${r.unit}`,
    },
    {
      header: "Han SD",
      accessor: "expiryDate",
      sortable: true,
      render: (row) => {
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
      header: "Trang thai",
      render: (row) => {
        if (row.quantity <= row.minStock)
          return (
            <Badge variant="danger" dot>
              Can bo sung
            </Badge>
          );
        if (isExpiringSoon(row.expiryDate))
          return (
            <Badge variant="warning" dot>
              Sap het han
            </Badge>
          );
        return (
          <Badge variant="success" dot>
            Binh thuong
          </Badge>
        );
      },
    },
  ];

  return (
    <PageWrapper
      title="Ton kho he thong"
      subtitle="Tong quan ton kho tat ca cua hang va kho nguyen lieu"
    >
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "var(--text-lg)",
            fontWeight: 600,
            marginBottom: "var(--space-4)",
            color: "var(--text-primary)",
          }}
        >
          Ton kho cua hang
        </h3>
        <DataTable
          columns={storeColumns}
          data={enrichedStoreInv}
          searchPlaceholder="Tim san pham, cua hang..."
        />
      </div>

      <div>
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "var(--text-lg)",
            fontWeight: 600,
            marginBottom: "var(--space-4)",
            color: "var(--text-primary)",
          }}
        >
          Kho nguyen lieu (Bep trung tam)
        </h3>
        <DataTable
          columns={kitchenColumns}
          data={kitchenInventory}
          searchPlaceholder="Tim nguyen lieu..."
        />
      </div>
    </PageWrapper>
  );
}
