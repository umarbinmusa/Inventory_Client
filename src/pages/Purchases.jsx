import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "react-toastify";
import { PlusIcon, TrashIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";

import { PURCHASES_QUERY } from "../graphql/queries/purchases.js";
import {
  CREATE_PURCHASE_MUTATION,
  UPDATE_PURCHASE_PAYMENT_MUTATION,
} from "../graphql/mutations/purchases.js";
import { SUPPLIERS_QUERY } from "../graphql/queries/suppliers.js";
import { PRODUCTS_QUERY } from "../graphql/queries/products.js";
import Modal from "../components/ui/Modal.jsx";
import Badge from "../components/ui/Badge.jsx";
import { currency, dateShort } from "../utils/format.js";

const PAYMENT_STATUS_OPTIONS = ["UNPAID", "PARTIAL", "PAID"];
const PAYMENT_TONE = { UNPAID: "out", PARTIAL: "low", PAID: "ok" };

const PurchaseForm = ({ suppliers, products, onSubmit, submitting, onCancel }) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      supplierId: "",
      paymentStatus: "UNPAID",
      items: [{ productId: "", quantity: 1, cost: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");

  const total = useMemo(
    () =>
      (items || []).reduce(
        (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.cost) || 0),
        0
      ),
    [items]
  );

  const submit = (values) => {
    onSubmit({
      supplierId: values.supplierId,
      paymentStatus: values.paymentStatus,
      items: values.items.map((it) => ({
        productId: it.productId,
        quantity: Number(it.quantity),
        cost: Number(it.cost),
      })),
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        <div>
          <label className="label" htmlFor="paymentStatus">
            Payment status
          </label>
          <select id="paymentStatus" className="input" {...register("paymentStatus")}>
            {PAYMENT_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="label mb-0">Items</label>
          <button
            type="button"
            onClick={() => append({ productId: "", quantity: 1, cost: "" })}
            className="text-xs font-medium text-brand-500 hover:underline"
          >
            + Add item
          </button>
        </div>

        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-2">
              <select
                className="input col-span-6"
                {...register(`items.${index}.productId`, { required: true })}
              >
                <option value="">Select product…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.productName} ({p.sku})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                placeholder="Qty"
                className="input col-span-2"
                {...register(`items.${index}.quantity`, { required: true, min: 1 })}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Cost"
                className="input col-span-3"
                {...register(`items.${index}.cost`, { required: true, min: 0 })}
              />
              <button
                type="button"
                onClick={() => fields.length > 1 && remove(index)}
                disabled={fields.length === 1}
                className="col-span-1 flex items-center justify-center rounded-md text-ink-dim hover:text-stock-out disabled:opacity-30 dark:text-ink-dark-dim"
                aria-label="Remove item"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3 dark:border-border-dark">
        <span className="text-sm font-medium text-ink-dim dark:text-ink-dark-dim">Total</span>
        <span className="figure text-lg font-semibold text-ink dark:text-ink-dark">
          {currency(total)}
        </span>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Saving…" : "Create purchase"}
        </button>
      </div>
    </form>
  );
};

const Purchases = () => {
  const { data, loading, error, refetch } = useQuery(PURCHASES_QUERY);
  const { data: suppliersData } = useQuery(SUPPLIERS_QUERY);
  const { data: productsData } = useQuery(PRODUCTS_QUERY);
  const [createPurchase, { loading: creating }] = useMutation(CREATE_PURCHASE_MUTATION);
  const [updatePayment] = useMutation(UPDATE_PURCHASE_PAYMENT_MUTATION);

  const [modalOpen, setModalOpen] = useState(false);
  const [detail, setDetail] = useState(null);

  const suppliers = suppliersData?.suppliers || [];
  const products = productsData?.products || [];

  const handleSubmit = async (input) => {
    try {
      await createPurchase({ variables: { input } });
      toast.success("Purchase recorded and stock updated.");
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.message || "Could not create purchase.");
    }
  };

  const handlePaymentChange = async (id, paymentStatus) => {
    try {
      await updatePayment({ variables: { id, paymentStatus } });
      toast.success("Payment status updated.");
      refetch();
    } catch (err) {
      toast.error(err.message || "Could not update payment status.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">
            Purchases
          </h1>
          <p className="mt-1 text-sm text-ink-dim dark:text-ink-dark-dim">
            Purchase orders from suppliers. Receiving a purchase increases stock immediately.
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <PlusIcon className="h-4 w-4" />
          New purchase
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading && (
          <div className="px-5 py-10 text-center text-sm text-ink-dim dark:text-ink-dark-dim">
            Loading purchases…
          </div>
        )}
        {error && (
          <div className="px-5 py-10 text-center text-sm text-stock-out">
            Couldn't load purchases: {error.message}
          </div>
        )}
        {!loading && !error && data?.purchases?.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <ShoppingCartIcon className="h-8 w-8 text-ink-dim dark:text-ink-dark-dim" />
            <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
              No purchases recorded yet.
            </p>
          </div>
        )}
        {!loading && !error && data?.purchases?.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-ink-dim dark:border-border-dark dark:text-ink-dark-dim">
                <tr>
                  <th className="px-5 py-3 font-medium">Supplier</th>
                  <th className="px-5 py-3 font-medium">Items</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium text-right">Received by</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-border-dark">
                {data.purchases.map((p) => (
                  <tr
                    key={p.id}
                    className="cursor-pointer hover:bg-canvas dark:hover:bg-canvas-dark"
                    onClick={() => setDetail(p)}
                  >
                    <td className="px-5 py-3 font-medium text-ink dark:text-ink-dark">
                      {p.supplier?.companyName || "—"}
                    </td>
                    <td className="px-5 py-3 text-ink-dim dark:text-ink-dark-dim">
                      {p.items.length} item{p.items.length === 1 ? "" : "s"}
                    </td>
                    <td className="figure px-5 py-3 text-ink dark:text-ink-dark">
                      {currency(p.totalAmount)}
                    </td>
                    <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={p.paymentStatus}
                        onChange={(e) => handlePaymentChange(p.id, e.target.value)}
                        className="rounded-md border border-border bg-surface px-2 py-1 text-xs dark:border-border-dark dark:bg-surface-dark dark:text-ink-dark"
                      >
                        {PAYMENT_STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0) + s.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-ink-dim dark:text-ink-dark-dim">
                      {dateShort(p.purchaseDate)}
                    </td>
                    <td className="px-5 py-3 text-right text-ink-dim dark:text-ink-dark-dim">
                      {p.receivedBy?.fullName || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New purchase" size="lg">
        <PurchaseForm
          suppliers={suppliers}
          products={products}
          submitting={creating}
          onCancel={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      </Modal>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Purchase detail" size="md">
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-ink dark:text-ink-dark">
                  {detail.supplier?.companyName}
                </p>
                <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                  {dateShort(detail.purchaseDate)}
                </p>
              </div>
              <Badge tone={PAYMENT_TONE[detail.paymentStatus]}>{detail.paymentStatus}</Badge>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-ink-dim dark:border-border-dark dark:text-ink-dark-dim">
                <tr>
                  <th className="py-2 font-medium">Product</th>
                  <th className="py-2 font-medium">Qty</th>
                  <th className="py-2 font-medium">Cost</th>
                  <th className="py-2 font-medium text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-border-dark">
                {detail.items.map((it, i) => (
                  <tr key={i}>
                    <td className="py-2">{it.product?.productName}</td>
                    <td className="figure py-2">
                      {it.quantity} {it.product?.unit}
                    </td>
                    <td className="figure py-2">{currency(it.cost)}</td>
                    <td className="figure py-2 text-right">{currency(it.cost * it.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t border-border pt-3 dark:border-border-dark">
              <span className="text-sm font-medium text-ink-dim dark:text-ink-dark-dim">Total</span>
              <span className="figure text-lg font-semibold text-ink dark:text-ink-dark">
                {currency(detail.totalAmount)}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Purchases;
