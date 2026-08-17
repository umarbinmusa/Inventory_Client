import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

import { ORDERS_QUERY } from "../graphql/queries/orders.js";
import {
  UPDATE_ORDER_STATUS_MUTATION,
  CONVERT_ORDER_TO_SALE_MUTATION,
} from "../graphql/mutations/orders.js";
import Modal from "../components/ui/Modal.jsx";
import Badge from "../components/ui/Badge.jsx";
import { currency, dateTimeShort } from "../utils/format.js";

const STATUS_TABS = ["ALL", "PENDING", "CONFIRMED", "PROCESSING", "READY", "COMPLETED", "CANCELLED"];

const STATUS_TONE = {
  PENDING: "low",
  CONFIRMED: "brand",
  PROCESSING: "brand",
  READY: "ok",
  COMPLETED: "ok",
  CANCELLED: "out",
};

// What each status is allowed to move to next - mirrors the backend's
// ALLOWED_TRANSITIONS so the UI only ever offers valid next steps.
const NEXT_STATUSES = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["READY", "CANCELLED"],
  READY: ["CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

const ConvertToSaleForm = ({ order, onSubmit, submitting, onCancel }) => {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: { amountPaid: order.total, paymentMethod: "CASH" },
  });
  const amountPaid = Number(watch("amountPaid")) || 0;
  const change = Math.max(amountPaid - order.total, 0);

  const submit = (values) => {
    onSubmit({
      amountPaid: Number(values.amountPaid),
      paymentMethod: values.paymentMethod,
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
      <div className="rounded-md bg-canvas px-3 py-2 text-sm dark:bg-canvas-dark">
        <div className="flex items-center justify-between text-ink-dim dark:text-ink-dark-dim">
          <span>Order total</span>
          <span className="figure font-semibold text-ink dark:text-ink-dark">
            {currency(order.total)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="amountPaid">
            Amount paid
          </label>
          <input
            id="amountPaid"
            type="number"
            min={order.total}
            step="0.01"
            className="input"
            {...register("amountPaid", { required: true, min: order.total })}
          />
        </div>
        <div>
          <label className="label" htmlFor="paymentMethod">
            Payment method
          </label>
          <select id="paymentMethod" className="input" {...register("paymentMethod")}>
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
            <option value="TRANSFER">Transfer</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold text-ink dark:border-border-dark dark:text-ink-dark">
        <span>Change</span>
        <span className="figure">{currency(change)}</span>
      </div>

      <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
        This deducts stock and creates a receipt. It can only be done once per order.
      </p>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Completing…" : "Complete sale"}
        </button>
      </div>
    </form>
  );
};

const OnlineOrders = () => {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { data, loading, error, refetch } = useQuery(ORDERS_QUERY, {
    variables: { status: statusFilter === "ALL" ? null : statusFilter },
  });
  const [updateStatus] = useMutation(UPDATE_ORDER_STATUS_MUTATION);
  const [convertToSale, { loading: converting }] = useMutation(CONVERT_ORDER_TO_SALE_MUTATION);

  const [detail, setDetail] = useState(null);
  const [convertTarget, setConvertTarget] = useState(null);

  const orders = useMemo(() => data?.orders || [], [data]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateStatus({ variables: { id, status } });
      toast.success(`Order moved to ${status.toLowerCase()}.`);
      refetch();
      setDetail((d) => (d?.id === id ? { ...d, status } : d));
    } catch (err) {
      toast.error(err.message || "Could not update order status.");
    }
  };

  const handleConvert = async (input) => {
    try {
      const res = await convertToSale({ variables: { id: convertTarget.id, input } });
      toast.success(`Sale completed — receipt ${res.data.convertOrderToSale.receiptNumber}.`);
      setConvertTarget(null);
      setDetail(null);
      refetch();
    } catch (err) {
      toast.error(err.message || "Could not complete the sale.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">
          Online Orders
        </h1>
        <p className="mt-1 text-sm text-ink-dim dark:text-ink-dark-dim">
          Bookings placed from the online storefront. Converting an order to a sale deducts stock.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === tab
                ? "bg-brand-500 text-white"
                : "bg-canvas text-ink-dim hover:text-ink dark:bg-canvas-dark dark:text-ink-dark-dim dark:hover:text-ink-dark"
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {loading && (
          <div className="px-5 py-10 text-center text-sm text-ink-dim dark:text-ink-dark-dim">
            Loading orders…
          </div>
        )}
        {error && (
          <div className="px-5 py-10 text-center text-sm text-stock-out">
            Couldn't load orders: {error.message}
          </div>
        )}
        {!loading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <ClipboardDocumentListIcon className="h-8 w-8 text-ink-dim dark:text-ink-dark-dim" />
            <p className="text-sm text-ink-dim dark:text-ink-dark-dim">No orders here yet.</p>
          </div>
        )}
        {!loading && !error && orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-ink-dim dark:border-border-dark dark:text-ink-dark-dim">
                <tr>
                  <th className="px-5 py-3 font-medium">Order #</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Items</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-border-dark">
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="cursor-pointer hover:bg-canvas dark:hover:bg-canvas-dark"
                    onClick={() => setDetail(o)}
                  >
                    <td className="figure px-5 py-3 font-medium text-ink dark:text-ink-dark">
                      {o.orderNumber}
                    </td>
                    <td className="px-5 py-3 text-ink dark:text-ink-dark">
                      <p className="font-medium">{o.customerName}</p>
                      <p className="text-xs text-ink-dim dark:text-ink-dark-dim">{o.customerPhone}</p>
                    </td>
                    <td className="px-5 py-3 text-ink-dim dark:text-ink-dark-dim">
                      {o.items.length} item{o.items.length === 1 ? "" : "s"}
                    </td>
                    <td className="figure px-5 py-3 text-ink dark:text-ink-dark">
                      {currency(o.total)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={STATUS_TONE[o.status]}>{o.status}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right text-ink-dim dark:text-ink-dark-dim">
                      {dateTimeShort(o.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.orderNumber} size="md">
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-ink dark:text-ink-dark">{detail.customerName}</p>
                <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                  {detail.customerPhone}
                  {detail.customerEmail ? ` · ${detail.customerEmail}` : ""}
                </p>
                {detail.customerAddress && (
                  <p className="text-xs text-ink-dim dark:text-ink-dark-dim">{detail.customerAddress}</p>
                )}
              </div>
              <Badge tone={STATUS_TONE[detail.status]}>{detail.status}</Badge>
            </div>

            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-ink-dim dark:border-border-dark dark:text-ink-dark-dim">
                <tr>
                  <th className="py-2 font-medium">Product</th>
                  <th className="py-2 font-medium">Qty</th>
                  <th className="py-2 font-medium">Price</th>
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
                    <td className="figure py-2">{currency(it.price)}</td>
                    <td className="figure py-2 text-right">{currency(it.price * it.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold text-ink dark:border-border-dark dark:text-ink-dark">
              <span>Total</span>
              <span className="figure">{currency(detail.total)}</span>
            </div>

            {detail.notes && (
              <p className="rounded-md bg-canvas px-3 py-2 text-xs text-ink-dim dark:bg-canvas-dark dark:text-ink-dark-dim">
                Note: {detail.notes}
              </p>
            )}

            {detail.convertedSale && (
              <p className="rounded-md bg-stock-ok/10 px-3 py-2 text-xs text-stock-ok">
                Completed as sale {detail.convertedSale.receiptNumber}.
              </p>
            )}

            {!detail.convertedSale && (NEXT_STATUSES[detail.status] || []).length > 0 && (
              <div className="flex flex-wrap justify-end gap-2 pt-2">
                {NEXT_STATUSES[detail.status]
                  .filter((s) => s !== "CANCELLED")
                  .map((s) => (
                    <button
                      key={s}
                      className="btn-secondary"
                      onClick={() => handleStatusChange(detail.id, s)}
                    >
                      Mark {s.toLowerCase()}
                    </button>
                  ))}
                {NEXT_STATUSES[detail.status].includes("CANCELLED") && (
                  <button
                    className="btn-secondary text-stock-out"
                    onClick={() => handleStatusChange(detail.id, "CANCELLED")}
                  >
                    Cancel order
                  </button>
                )}
                <button className="btn-primary" onClick={() => setConvertTarget(detail)}>
                  Complete as sale
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={!!convertTarget}
        onClose={() => setConvertTarget(null)}
        title="Complete order as sale"
        size="sm"
      >
        {convertTarget && (
          <ConvertToSaleForm
            order={convertTarget}
            submitting={converting}
            onCancel={() => setConvertTarget(null)}
            onSubmit={handleConvert}
          />
        )}
      </Modal>
    </div>
  );
};

export default OnlineOrders;
