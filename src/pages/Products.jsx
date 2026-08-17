import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CubeIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

import {
  PRODUCTS_QUERY,
  SEARCH_PRODUCTS_QUERY,
  LOW_STOCK_PRODUCTS_QUERY,
  OUT_OF_STOCK_PRODUCTS_QUERY,
  EXPIRING_PRODUCTS_QUERY,
} from "../graphql/queries/products.js";
import {
  CREATE_PRODUCT_MUTATION,
  UPDATE_PRODUCT_MUTATION,
  DELETE_PRODUCT_MUTATION,
} from "../graphql/mutations/products.js";
import { CATEGORIES_QUERY } from "../graphql/queries/categories.js";
import { SUPPLIERS_QUERY } from "../graphql/queries/suppliers.js";
import { STOCK_MOVEMENTS_QUERY } from "../graphql/queries/stock.js";
import {
  STOCK_IN_MUTATION,
  STOCK_OUT_MUTATION,
  STOCK_ADJUST_MUTATION,
} from "../graphql/mutations/stock.js";
import Modal from "../components/ui/Modal.jsx";
import Badge from "../components/ui/Badge.jsx";
import ImageUploader from "../components/ui/ImageUploader.jsx";
import { currency, dateShort, dateTimeShort } from "../utils/format.js";

const STOCK_BADGE = {
  IN_STOCK: { tone: "ok", label: "In stock" },
  LOW_STOCK: { tone: "low", label: "Low stock" },
  OUT_OF_STOCK: { tone: "out", label: "Out of stock" },
};

const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "DISCONTINUED"];

const TABS = [
  { key: "all", label: "All products" },
  { key: "low", label: "Low stock" },
  { key: "out", label: "Out of stock" },
  { key: "expiring", label: "Expiring soon" },
];

const ProductForm = ({ initial, categories, suppliers, onSubmit, submitting, onCancel }) => {
  const [image, setImage] = useState(initial?.image || "");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      sku: initial?.sku || "",
      barcode: initial?.barcode || "",
      productName: initial?.productName || "",
      categoryId: initial?.category?.id || "",
      supplierId: initial?.supplier?.id || "",
      purchasePrice: initial?.purchasePrice ?? "",
      sellingPrice: initial?.sellingPrice ?? "",
      quantity: initial?.quantity ?? 0,
      minimumStock: initial?.minimumStock ?? 0,
      unit: initial?.unit || "pcs",
      description: initial?.description || "",
      status: initial?.status || "ACTIVE",
      expiryDate: initial?.expiryDate ? initial.expiryDate.slice(0, 10) : "",
    },
  });

  const submit = (values) => {
    onSubmit({
      ...values,
      image: image || null,
      purchasePrice: Number(values.purchasePrice),
      sellingPrice: Number(values.sellingPrice),
      quantity: Number(values.quantity),
      minimumStock: Number(values.minimumStock),
      expiryDate: values.expiryDate || null,
      barcode: values.barcode || null,
      description: values.description || null,
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
      <ImageUploader value={image} onChange={setImage} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="productName">
            Product name
          </label>
          <input
            id="productName"
            className="input"
            {...register("productName", { required: "Product name is required" })}
          />
          {errors.productName && <p className="field-error">{errors.productName.message}</p>}
        </div>
        <div>
          <label className="label" htmlFor="sku">
            SKU
          </label>
          <input
            id="sku"
            className="input"
            {...register("sku", { required: "SKU is required" })}
          />
          {errors.sku && <p className="field-error">{errors.sku.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="categoryId">
            Category
          </label>
          <select
            id="categoryId"
            className="input"
            {...register("categoryId", { required: "Category is required" })}
          >
            <option value="">Select category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="field-error">{errors.categoryId.message}</p>}
        </div>
        <div>
          <label className="label" htmlFor="supplierId">
            Supplier
          </label>
          <select
            id="supplierId"
            className="input"
            {...register("supplierId", { required: "Supplier is required" })}
          >
            <option value="">Select supplier…</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.companyName}
              </option>
            ))}
          </select>
          {errors.supplierId && <p className="field-error">{errors.supplierId.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label className="label" htmlFor="purchasePrice">
            Purchase price
          </label>
          <input
            id="purchasePrice"
            type="number"
            step="0.01"
            min="0"
            className="input"
            {...register("purchasePrice", { required: "Required", min: 0 })}
          />
        </div>
        <div>
          <label className="label" htmlFor="sellingPrice">
            Selling price
          </label>
          <input
            id="sellingPrice"
            type="number"
            step="0.01"
            min="0"
            className="input"
            {...register("sellingPrice", { required: "Required", min: 0 })}
          />
        </div>
        <div>
          <label className="label" htmlFor="quantity">
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            min="0"
            className="input"
            disabled={!!initial}
            title={initial ? "Use stock actions to change quantity" : undefined}
            {...register("quantity", { required: "Required", min: 0 })}
          />
        </div>
        <div>
          <label className="label" htmlFor="minimumStock">
            Min. stock
          </label>
          <input
            id="minimumStock"
            type="number"
            min="0"
            className="input"
            {...register("minimumStock", { required: "Required", min: 0 })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="unit">
            Unit
          </label>
          <input id="unit" className="input" {...register("unit")} />
        </div>
        <div>
          <label className="label" htmlFor="status">
            Status
          </label>
          <select id="status" className="input" {...register("status")}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="expiryDate">
            Expiry date
          </label>
          <input id="expiryDate" type="date" className="input" {...register("expiryDate")} />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="barcode">
          Barcode
        </label>
        <input id="barcode" className="input" {...register("barcode")} />
      </div>

      <div>
        <label className="label" htmlFor="description">
          Description
        </label>
        <textarea id="description" rows={2} className="input" {...register("description")} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Saving…" : initial ? "Save changes" : "Create product"}
        </button>
      </div>
    </form>
  );
};

const StockActionForm = ({ product, action, onSubmit, submitting, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { quantity: "", reason: "" } });

  const labels = {
    in: { title: "Add stock", verb: "Add" },
    out: { title: "Remove stock", verb: "Remove" },
    adjust: { title: "Adjust stock", verb: "Set change" },
  };

  const submit = (values) => {
    onSubmit({
      quantity: Number(values.quantity),
      reason: values.reason || null,
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
      <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
        {product.productName}{" "}
        <span className="figure text-ink dark:text-ink-dark">
          ({product.quantity} {product.unit} in stock)
        </span>
      </p>

      <div>
        <label className="label" htmlFor="quantity">
          {action === "adjust" ? "Change (use negative to reduce)" : "Quantity"}
        </label>
        <input
          id="quantity"
          type="number"
          className="input"
          {...register("quantity", { required: "Required", validate: (v) => Number(v) !== 0 || "Enter a non-zero amount" })}
        />
        {errors.quantity && <p className="field-error">{errors.quantity.message}</p>}
      </div>

      <div>
        <label className="label" htmlFor="reason">
          Reason (optional)
        </label>
        <input id="reason" className="input" {...register("reason")} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Saving…" : labels[action].verb}
        </button>
      </div>
    </form>
  );
};

const MOVEMENT_LABEL = {
  PURCHASE: "Purchase",
  SALE: "Sale",
  STOCK_IN: "Stock in",
  STOCK_OUT: "Stock out",
  ADJUSTMENT: "Adjustment",
  TRANSFER: "Transfer",
};

const StockHistory = ({ product }) => {
  const { data, loading, error } = useQuery(STOCK_MOVEMENTS_QUERY, {
    variables: { productId: product.id },
    fetchPolicy: "network-only",
  });

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
        Movement history for <span className="font-medium text-ink dark:text-ink-dark">{product.productName}</span>
      </p>
      {loading && <p className="text-sm text-ink-dim dark:text-ink-dark-dim">Loading…</p>}
      {error && <p className="text-sm text-stock-out">Couldn't load history: {error.message}</p>}
      {!loading && !error && data?.stockMovements?.length === 0 && (
        <p className="text-sm text-ink-dim dark:text-ink-dark-dim">No stock movements recorded yet.</p>
      )}
      {!loading && !error && data?.stockMovements?.length > 0 && (
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-ink-dim dark:border-border-dark dark:text-ink-dark-dim">
              <tr>
                <th className="py-2 font-medium">Type</th>
                <th className="py-2 font-medium">Qty</th>
                <th className="py-2 font-medium">Reason</th>
                <th className="py-2 font-medium">By</th>
                <th className="py-2 font-medium">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-border-dark">
              {data.stockMovements.map((m) => (
                <tr key={m.id}>
                  <td className="py-2 pr-2">{MOVEMENT_LABEL[m.type] || m.type}</td>
                  <td className={`figure py-2 pr-2 ${m.quantity < 0 ? "text-stock-out" : "text-stock-ok"}`}>
                    {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                  </td>
                  <td className="py-2 pr-2 text-ink-dim dark:text-ink-dark-dim">{m.reason || "—"}</td>
                  <td className="py-2 pr-2 text-ink-dim dark:text-ink-dark-dim">
                    {m.performedBy?.fullName || "—"}
                  </td>
                  <td className="py-2 text-ink-dim dark:text-ink-dark-dim">{dateTimeShort(m.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get("filter");
  const initialQuery = searchParams.get("q") || "";

  const [tab, setTab] = useState(
    initialFilter && TABS.some((t) => t.key === initialFilter) ? initialFilter : "all"
  );
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [activeSearch, setActiveSearch] = useState(initialQuery);

  const { data: categoriesData } = useQuery(CATEGORIES_QUERY);
  const { data: suppliersData } = useQuery(SUPPLIERS_QUERY);

  const allProducts = useQuery(PRODUCTS_QUERY, { skip: tab !== "all" || !!activeSearch });
  const lowStock = useQuery(LOW_STOCK_PRODUCTS_QUERY, { skip: tab !== "low" });
  const outOfStock = useQuery(OUT_OF_STOCK_PRODUCTS_QUERY, { skip: tab !== "out" });
  const expiring = useQuery(EXPIRING_PRODUCTS_QUERY, {
    skip: tab !== "expiring",
    variables: { withinDays: 30 },
  });
  const [runSearch, searchResult] = useLazyQuery(SEARCH_PRODUCTS_QUERY, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (initialQuery) runSearch({ variables: { query: initialQuery } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [createProduct, { loading: creating }] = useMutation(CREATE_PRODUCT_MUTATION);
  const [updateProduct, { loading: updating }] = useMutation(UPDATE_PRODUCT_MUTATION);
  const [deleteProduct] = useMutation(DELETE_PRODUCT_MUTATION);
  const [stockIn, { loading: stockingIn }] = useMutation(STOCK_IN_MUTATION);
  const [stockOut, { loading: stockingOut }] = useMutation(STOCK_OUT_MUTATION);
  const [stockAdjust, { loading: adjusting }] = useMutation(STOCK_ADJUST_MUTATION);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [stockModal, setStockModal] = useState(null); // { product, action }
  const [historyProduct, setHistoryProduct] = useState(null);

  const categories = categoriesData?.categories || [];
  const suppliers = suppliersData?.suppliers || [];

  const current = activeSearch
    ? searchResult
    : tab === "all"
      ? allProducts
      : tab === "low"
        ? lowStock
        : tab === "out"
          ? outOfStock
          : expiring;

  const products = useMemo(() => {
    if (activeSearch) return current.data?.searchProducts || [];
    if (tab === "all") return current.data?.products || [];
    if (tab === "low") return current.data?.lowStockProducts || [];
    if (tab === "out") return current.data?.outOfStockProducts || [];
    return current.data?.expiringProducts || [];
  }, [activeSearch, tab, current.data]);

  const refetchCurrent = () => current.refetch?.();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setActiveSearch("");
      setSearchParams((params) => {
        params.delete("q");
        return params;
      });
      return;
    }
    setActiveSearch(searchTerm.trim());
    runSearch({ variables: { query: searchTerm.trim() } });
    setSearchParams((params) => {
      params.set("q", searchTerm.trim());
      params.delete("filter");
      return params;
    });
  };

  const clearSearch = () => {
    setSearchTerm("");
    setActiveSearch("");
    setSearchParams((params) => {
      params.delete("q");
      return params;
    });
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    const { categoryId, supplierId, ...rest } = values;
    const input = { ...rest, categoryId, supplierId };
    try {
      if (editing) {
        // quantity is locked in the form when editing; keep the existing value
        input.quantity = editing.quantity;
        await updateProduct({ variables: { id: editing.id, input } });
        toast.success("Product updated.");
      } else {
        await createProduct({ variables: { input } });
        toast.success("Product created.");
      }
      setModalOpen(false);
      refetchCurrent();
    } catch (err) {
      toast.error(err.message || "Could not save product.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct({ variables: { id } });
      toast.success("Product deleted.");
      setPendingDeleteId(null);
      refetchCurrent();
    } catch (err) {
      toast.error(err.message || "Could not delete product.");
    }
  };

  const handleStockAction = async ({ quantity, reason }) => {
    const { product, action } = stockModal;
    try {
      if (action === "in") {
        await stockIn({ variables: { productId: product.id, quantity, reason } });
      } else if (action === "out") {
        await stockOut({ variables: { productId: product.id, quantity, reason } });
      } else {
        await stockAdjust({ variables: { productId: product.id, quantity, reason } });
      }
      toast.success("Stock updated.");
      setStockModal(null);
      refetchCurrent();
    } catch (err) {
      toast.error(err.message || "Could not update stock.");
    }
  };

  const loading = current.loading;
  const error = current.error;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">
            Products
          </h1>
          <p className="mt-1 text-sm text-ink-dim dark:text-ink-dark-dim">
            Manage your catalog, pricing, and stock levels.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <PlusIcon className="h-4 w-4" />
          New product
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-md border border-border bg-surface p-1 dark:border-border-dark dark:bg-surface-dark">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                clearSearch();
                setTab(t.key);
                setSearchParams((params) => {
                  if (t.key === "all") params.delete("filter");
                  else params.set("filter", t.key);
                  return params;
                });
              }}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === t.key && !activeSearch
                  ? "bg-brand-500 text-white"
                  : "text-ink-dim hover:bg-canvas dark:text-ink-dark-dim dark:hover:bg-canvas-dark"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dim dark:text-ink-dark-dim" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, SKU, barcode…"
            className="input pl-9"
          />
          {activeSearch && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-ink-dim hover:underline dark:text-ink-dark-dim"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      <div className="card overflow-hidden">
        {loading && (
          <div className="px-5 py-10 text-center text-sm text-ink-dim dark:text-ink-dark-dim">
            Loading products…
          </div>
        )}
        {error && (
          <div className="px-5 py-10 text-center text-sm text-stock-out">
            Couldn't load products: {error.message}
          </div>
        )}
        {!loading && !error && products.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <CubeIcon className="h-8 w-8 text-ink-dim dark:text-ink-dark-dim" />
            <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
              {activeSearch ? "No products match your search." : "No products here yet."}
            </p>
          </div>
        )}
        {!loading && !error && products.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-ink-dim dark:border-border-dark dark:text-ink-dark-dim">
                <tr>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Supplier</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-border-dark">
                {products.map((p) => {
                  const badge = STOCK_BADGE[p.stockStatus] || STOCK_BADGE.IN_STOCK;
                  return (
                    <tr key={p.id}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.productName}
                              className="h-9 w-9 shrink-0 rounded-md border border-border object-cover dark:border-border-dark"
                            />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-dashed border-border text-ink-dim dark:border-border-dark dark:text-ink-dark-dim">
                              <CubeIcon className="h-4 w-4" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-ink dark:text-ink-dark">{p.productName}</p>
                            <p className="figure text-xs text-ink-dim dark:text-ink-dark-dim">{p.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-ink-dim dark:text-ink-dark-dim">
                        {p.category?.name || "—"}
                      </td>
                      <td className="px-5 py-3 text-ink-dim dark:text-ink-dark-dim">
                        {p.supplier?.companyName || "—"}
                      </td>
                      <td className="figure px-5 py-3 text-ink dark:text-ink-dark">
                        {currency(p.sellingPrice)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="figure text-ink dark:text-ink-dark">
                            {p.quantity} {p.unit}
                          </span>
                          <Badge tone={badge.tone}>{badge.label}</Badge>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-ink-dim dark:text-ink-dark-dim">
                        {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {pendingDeleteId === p.id ? (
                            <span className="inline-flex items-center gap-2">
                              <button
                                onClick={() => handleDelete(p.id)}
                                className="text-xs font-medium text-stock-out hover:underline"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setPendingDeleteId(null)}
                                className="text-xs font-medium text-ink-dim hover:underline dark:text-ink-dark-dim"
                              >
                                Cancel
                              </button>
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => setStockModal({ product: p, action: "in" })}
                                className="rounded-md p-1.5 text-ink-dim hover:bg-canvas hover:text-stock-ok dark:text-ink-dark-dim dark:hover:bg-canvas-dark"
                                aria-label={`Add stock for ${p.productName}`}
                                title="Add stock"
                              >
                                <ArrowDownTrayIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setStockModal({ product: p, action: "out" })}
                                className="rounded-md p-1.5 text-ink-dim hover:bg-canvas hover:text-stock-out dark:text-ink-dark-dim dark:hover:bg-canvas-dark"
                                aria-label={`Remove stock for ${p.productName}`}
                                title="Remove stock"
                              >
                                <ArrowUpTrayIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setStockModal({ product: p, action: "adjust" })}
                                className="rounded-md p-1.5 text-ink-dim hover:bg-canvas hover:text-ink dark:text-ink-dark-dim dark:hover:bg-canvas-dark"
                                aria-label={`Adjust stock for ${p.productName}`}
                                title="Adjust stock"
                              >
                                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setHistoryProduct(p)}
                                className="rounded-md p-1.5 text-ink-dim hover:bg-canvas hover:text-ink dark:text-ink-dark-dim dark:hover:bg-canvas-dark"
                                aria-label={`View history for ${p.productName}`}
                                title="Stock history"
                              >
                                <ClockIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openEdit(p)}
                                className="rounded-md p-1.5 text-ink-dim hover:bg-canvas hover:text-ink dark:text-ink-dark-dim dark:hover:bg-canvas-dark"
                                aria-label={`Edit ${p.productName}`}
                                title="Edit"
                              >
                                <PencilSquareIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setPendingDeleteId(p.id)}
                                className="rounded-md p-1.5 text-ink-dim hover:bg-canvas hover:text-stock-out dark:text-ink-dark-dim dark:hover:bg-canvas-dark"
                                aria-label={`Delete ${p.productName}`}
                                title="Delete"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit product" : "New product"}
        size="lg"
      >
        <ProductForm
          initial={editing}
          categories={categories}
          suppliers={suppliers}
          submitting={creating || updating}
          onCancel={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      </Modal>

      <Modal
        open={!!stockModal}
        onClose={() => setStockModal(null)}
        title={
          stockModal?.action === "in"
            ? "Add stock"
            : stockModal?.action === "out"
              ? "Remove stock"
              : "Adjust stock"
        }
      >
        {stockModal && (
          <StockActionForm
            product={stockModal.product}
            action={stockModal.action}
            submitting={stockingIn || stockingOut || adjusting}
            onCancel={() => setStockModal(null)}
            onSubmit={handleStockAction}
          />
        )}
      </Modal>

      <Modal
        open={!!historyProduct}
        onClose={() => setHistoryProduct(null)}
        title="Stock history"
        size="lg"
      >
        {historyProduct && <StockHistory product={historyProduct} />}
      </Modal>
    </div>
  );
};

export default Products;
