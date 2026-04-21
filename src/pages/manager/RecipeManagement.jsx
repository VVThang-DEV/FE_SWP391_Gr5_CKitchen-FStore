import { useState, useEffect, useMemo } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import PageWrapper from "../../components/layout/PageWrapper/PageWrapper";
import { DataTable, Badge, Button, Modal } from "../../components/ui";
import { Input, Select } from "../../components/ui";
import managerService from "../../services/managerService";

const UNIT_OPTIONS = [
  { value: "kg", label: "kg" },
  { value: "g", label: "g" },
  { value: "lít", label: "lít" },
  { value: "ml", label: "ml" },
  { value: "cái", label: "cái" },
];

const EMPTY_FORM = {
  productId: "",
  ingredientId: "",
  quantity: "",
  unit: "kg",
};

export default function RecipeManagement() {
  const [recipes, setRecipes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let mounted = true;
    Promise.all([
      managerService.recipes.getAll({ size: 200 }),
      managerService.products.getAll({ size: 200 }),
    ])
      .then(([rec, prod]) => {
        if (!mounted) return;
        setRecipes(Array.isArray(rec) ? rec : (rec?.content ?? []));
        setProducts(Array.isArray(prod) ? prod : (prod?.content ?? []));
      })
      .catch(() => {
        if (mounted) toast.error("Không thể tải dữ liệu công thức");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const productOptions = products.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.id})`,
  }));

  // Group flat recipe rows by productId — one row per product with ingredients[]
  const groupedRecipes = useMemo(() => {
    const map = {};
    recipes.forEach((r) => {
      if (!map[r.productId]) {
        map[r.productId] = {
          productId: r.productId,
          productName: r.productName,
          ingredients: [],
        };
      }
      map[r.productId].ingredients.push(r);
    });
    return Object.values(map);
  }, [recipes]);

  const handleOpenNew = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setEditItem(row);
    setForm({
      productId: row.productId ?? "",
      ingredientId: row.ingredientId ?? "",
      quantity: row.quantity ?? "",
      unit: row.unit ?? "kg",
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const errs = {};
    if (!editItem && !form.productId) errs.productId = "Vui lòng chọn sản phẩm";
    if (!editItem && !form.ingredientId)
      errs.ingredientId = "Vui lòng chọn nguyên liệu";
    if (!form.quantity || parseFloat(form.quantity) <= 0)
      errs.quantity = "Định mức phải lớn hơn 0";
    if (!form.unit) errs.unit = "Vui lòng chọn đơn vị";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editItem) {
        const payload = {
          quantity: parseFloat(form.quantity),
          unit: form.unit,
        };
        const updated = await managerService.recipes.update(
          editItem.id,
          payload,
        );
        setRecipes((prev) =>
          prev.map((r) =>
            r.id === editItem.id ? (updated ?? { ...r, ...payload }) : r,
          ),
        );
        toast.success("Đã cập nhật công thức");
      } else {
        const payload = {
          productId: form.productId,
          ingredientId: form.ingredientId,
          quantity: parseFloat(form.quantity),
          unit: form.unit,
        };
        const created = await managerService.recipes.create(payload);
        setRecipes((prev) => [...prev, created]);
        toast.success("Đã thêm công thức");
      }
      setShowModal(false);
    } catch (err) {
      const msg = err.response?.data?.message ?? "Lưu công thức thất bại";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setSaving(true);
    try {
      await managerService.recipes.delete(confirmDelete.id);
      setRecipes((prev) => prev.filter((r) => r.id !== confirmDelete.id));
      toast.success("Đã xóa");
      setConfirmDelete(null);
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: "Sản phẩm",
      accessor: "productName",
      sortable: true,
      width: "200px",
      render: (r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.productName || r.productId}</div>
          <div
            className="font-mono"
            style={{ fontSize: "11px", color: "var(--text-muted)" }}
          >
            {r.productId}
          </div>
        </div>
      ),
    },
    {
      header: "Thành phần & Định mức",
      render: (r) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {r.ingredients.map((ing) => (
            <div
              key={ing.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "13px",
              }}
            >
              <span style={{ fontWeight: 500 }}>
                {ing.ingredientName || ing.ingredientId}
              </span>
              <span
                className="font-mono"
                style={{ color: "var(--text-muted)", fontSize: "11px" }}
              >
                {ing.ingredientId}
              </span>
              <span
                className="font-mono"
                style={{ color: "var(--primary)", marginLeft: "auto" }}
              >
                {ing.quantity} {ing.unit}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      header: "",
      width: "90px",
      render: (row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {row.ingredients.map((ing) => (
            <div key={ing.id} style={{ display: "flex", gap: "4px" }}>
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                icon={Edit}
                title="Sửa"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(ing);
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                icon={Trash2}
                title="Xóa"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(ing);
                }}
              />
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <PageWrapper
      title="Quản lý công thức"
      subtitle="Định mức nguyên liệu cho từng sản phẩm"
      actions={
        <Button icon={Plus} onClick={handleOpenNew}>
          Thêm công thức
        </Button>
      }
    >
      <DataTable
        columns={columns}
        data={groupedRecipes}
        loading={loading}
        searchPlaceholder="Tìm theo sản phẩm hoặc nguyên liệu..."
        toolbar={
          <Badge variant="primary">{groupedRecipes.length} sản phẩm</Badge>
        }
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editItem ? "Sửa công thức" : "Thêm công thức"}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {editItem ? "Lưu thay đổi" : "Thêm"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Select
            label="Sản phẩm"
            required
            options={productOptions}
            value={form.productId}
            onChange={(e) =>
              setForm((f) => ({ ...f, productId: e.target.value }))
            }
            error={errors.productId}
            disabled={!!editItem}
          />
          <Input
            label="Mã nguyên liệu"
            required
            value={form.ingredientId}
            onChange={(e) =>
              setForm((f) => ({ ...f, ingredientId: e.target.value }))
            }
            placeholder="Nhập mã nguyên liệu (VD: ING001)"
            error={errors.ingredientId}
            disabled={!!editItem}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <Input
              label="Định mức"
              required
              type="number"
              step="0.001"
              min="0"
              value={form.quantity}
              onChange={(e) =>
                setForm((f) => ({ ...f, quantity: e.target.value }))
              }
              placeholder="0.20"
              error={errors.quantity}
            />
            <Select
              label="Đơn vị"
              required
              options={UNIT_OPTIONS}
              value={form.unit}
              onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
              error={errors.unit}
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Xác nhận xóa"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={saving}
            >
              Xóa
            </Button>
          </>
        }
      >
        <p>
          Xóa công thức{" "}
          <strong>
            {confirmDelete?.ingredientName || confirmDelete?.ingredientId}
          </strong>{" "}
          cho sản phẩm{" "}
          <strong>
            {confirmDelete?.productName || confirmDelete?.productId}
          </strong>
          ?
        </p>
      </Modal>
    </PageWrapper>
  );
}
