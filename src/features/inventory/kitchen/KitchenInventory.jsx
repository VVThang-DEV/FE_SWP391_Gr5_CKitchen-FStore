import PageWrapper from "../../../components/layout/PageWrapper/PageWrapper";
import { DataTable, Badge } from "../../../components/ui";
import { useData } from "../../../contexts/DataContext";

export default function KitchenInventory() {
  const { kitchenInventory, formatDate, isExpiringSoon, isExpired } = useData();

  const columns = [
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
      title="Kho nguyen lieu"
      subtitle="Quan ly nguyen lieu dau vao, han su dung va lo hang"
    >
      <DataTable
        columns={columns}
        data={kitchenInventory}
        searchPlaceholder="Tim nguyen lieu..."
      />
    </PageWrapper>
  );
}
