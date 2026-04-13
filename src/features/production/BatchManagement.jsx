import PageWrapper from "../../components/layout/PageWrapper/PageWrapper";
import { DataTable, Badge } from "../../components/ui";
import { useData } from "../../contexts/DataContext";

const BATCH_STATUS = {
  planned: { label: "Da len ke hoach", variant: "info" },
  in_progress: { label: "Dang san xuat", variant: "accent" },
  completed: { label: "Hoan thanh", variant: "success" },
};

export default function BatchManagement() {
  const { batches, formatDateTime } = useData();

  const columns = [
    {
      header: "Ma lo",
      accessor: "id",
      render: (r) => (
        <span
          className="font-mono"
          style={{ fontWeight: 600, color: "var(--primary)" }}
        >
          {r.id}
        </span>
      ),
    },
    { header: "San pham", accessor: "productName", sortable: true },
    {
      header: "So luong",
      accessor: "quantity",
      render: (r) => `${r.quantity} ${r.unit}`,
    },
    {
      header: "Trang thai",
      accessor: "status",
      render: (r) => {
        const s = BATCH_STATUS[r.status];
        return (
          <Badge variant={s.variant} dot>
            {s.label}
          </Badge>
        );
      },
    },
    {
      header: "Bat dau",
      accessor: "startDate",
      render: (r) => formatDateTime(r.startDate),
    },
    {
      header: "Ket thuc",
      accessor: "endDate",
      render: (r) => (r.endDate ? formatDateTime(r.endDate) : "—"),
    },
    { header: "Phu trach", accessor: "staff" },
  ];

  return (
    <PageWrapper
      title="Quan ly lo san xuat"
      subtitle="Theo doi tien do cac lo san xuat"
    >
      <DataTable
        columns={columns}
        data={batches}
        searchPlaceholder="Tim theo ma lo, san pham..."
      />
    </PageWrapper>
  );
}
