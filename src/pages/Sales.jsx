import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "react-toastify";
import { PlusIcon, TrashIcon, BanknotesIcon, PrinterIcon } from "@heroicons/react/24/outline";

import { SALES_QUERY } from "../graphql/queries/sales.js";
import { CREATE_SALE_MUTATION } from "../graphql/mutations/sales.js";
import { CUSTOMERS_QUERY } from "../graphql/queries/customers.js";
import { PRODUCTS_QUERY } from "../graphql/queries/products.js";
import Modal from "../components/ui/Modal.jsx";
import Badge from "../components/ui/Badge.jsx";
import { currency, dateTimeShort } from "../utils/format.js";
import { printReceipt } from "../utils/printReceipt.js";

const PAYMENT_METHODS = ["CASH", "CARD", "TRANSFER"];

const SaleForm = ({ customers, products, onSubmit, submitting, onCancel }) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customerId: "",
      paymentMethod: "CASH",
      discount: 0,
      taxRate: 0,
      amountPaid: 0,
      items: [{ productId: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");
  const discount = Number(watch("discount")) || 0;
  const taxRate = Number(watch("taxRate")) || 0;
  const amountPaid = Number(watch("amountPaid")) || 0;

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const subtotal = useMemo(
    () =>
      (items || []).reduce((sum, it) => {
        const product = productMap.get(it.productId);
        return sum + (Number(it.quantity) || 0) * (product?.sellingPrice || 0);
      }, 0),
    [items, productMap]
  );

  const tax = subtotal * (taxRate / 100);
  const total = Math.max(subtotal - discount + tax, 0);
  const change = Math.max(amountPaid - total, 0);

  const submit = (values) => {
    onSubmit({
      customerId: values.customerId || null,
      paymentMethod: values.paymentMethod,
      discount: Number(values.discount) || 0,
      taxRate: Number(values.taxRate) || 0,
      amountPaid: Number(values.amountPaid) || total,
      items: values.items.map((it) => ({
        productId: it.productId,
        quantity: Number(it.quantity),
      })),
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="customerId">
            Customer (optional)
          </label>
          <select id="customerId" className="input" {...register("customerId")}>
            <option value="">Walk-in customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="paymentMethod">
            Payment method
          </label>
          <select id="paymentMethod" className="input" {...register("paymentMethod")}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m.charAt(0) + m.slice(1).toLowerCase()}
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
            onClick={() => append({ productId: "", quantity: 1 })}
            className="text-xs font-medium text-brand-500 hover:underline"
          >
            + Add item
          </button>
        </div>

        <div className="space-y-2">
          {fields.map((field, index) => {
            const selected = productMap.get(items?.[index]?.productId);
            return (
              <div key={field.id} className="grid grid-cols-12 items-center gap-2">
                <select
                  className="input col-span-7"
                  {...register(`items.${index}.productId`, { required: true })}
                >
                  <option value="">Select product…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                      {p.productName} ({p.sku}) · {p.quantity} in stock
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  max={selected?.quantity || undefined}
                  placeholder="Qty"
                  className="input col-span-3"
                  {...register(`items.${index}.quantity`, { required: true, min: 1 })}
                />
                <span className="figure col-span-1 text-xs text-ink-dim dark:text-ink-dark-dim">
                  {selected ? currency(selected.sellingPrice) : "—"}
                </span>
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
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="discount">
            Discount ($)
          </label>
          <input
            id="discount"
            type="number"
            min="0"
            step="0.01"
            className="input"
            {...register("discount", { min: 0 })}
          />
        </div>
        <div>
          <label className="label" htmlFor="taxRate">
            Tax rate (%)
          </label>
          <input
            id="taxRate"
            type="number"
            min="0"
            step="0.01"
            className="input"
            {...register("taxRate", { min: 0 })}
          />
        </div>
      </div>

      <div className="space-y-1 border-t border-border pt-3 text-sm dark:border-border-dark">
        <div className="flex items-center justify-between text-ink-dim dark:text-ink-dark-dim">
          <span>Subtotal</span>
          <span className="figure">{currency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-ink-dim dark:text-ink-dark-dim">
          <span>Discount</span>
          <span className="figure">-{currency(discount)}</span>
        </div>
        <div className="flex items-center justify-between text-ink-dim dark:text-ink-dark-dim">
          <span>Tax</span>
          <span className="figure">{currency(tax)}</span>
        </div>
        <div className="flex items-center justify-between text-base font-semibold text-ink dark:text-ink-dark">
          <span>Total</span>
          <span className="figure">{currency(total)}</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="label" htmlFor="amountPaid">
            Amount paid
          </label>
          <button
            type="button"
            onClick={() => setValue("amountPaid", total)}
            className="text-xs font-medium text-brand-500 hover:underline"
          >
            Use exact total
          </button>
        </div>
        <input
          id="amountPaid"
          type="number"
          min={total}
          step="0.01"
          className="input"
          {...register("amountPaid", { required: true, min: total })}
        />
        {errors.amountPaid && (
          <p className="field-error">Amount paid must cover the total.</p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold text-ink dark:border-border-dark dark:text-ink-dark">
        <span>Change</span>
        <span className="figure">{currency(change)}</span>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Saving…" : "Complete sale"}
        </button>
      </div>
    </form>
  );
};

const PAYMENT_TONE = { CASH: "ok", CARD: "brand", TRANSFER: "low" };

const Sales = () => {
  const { data, loading, error, refetch } = useQuery(SALES_QUERY);
  const { data: customersData } = useQuery(CUSTOMERS_QUERY);
  const { data: productsData, refetch: refetchProducts } = useQuery(PRODUCTS_QUERY);
  const [createSale, { loading: creating }] = useMutation(CREATE_SALE_MUTATION);

  const [modalOpen, setModalOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [justCompleted, setJustCompleted] = useState(null);

  const customers = customersData?.customers || [];
  const products = productsData?.products || [];

  const handleSubmit = async (input) => {
    try {
      const res = await createSale({ variables: { input } });
      toast.success("Sale completed.");
      setModalOpen(false);
      setJustCompleted(res.data.createSale);
      refetch();
      refetchProducts();
    } catch (err) {
      toast.error(err.message || "Could not complete sale.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">
            Sales
          </h1>
          <p className="mt-1 text-sm text-ink-dim dark:text-ink-dark-dim">
            Point-of-sale transactions. Completing a sale deducts inventory.
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <PlusIcon className="h-4 w-4" />
          New sale
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading && (
          <div className="px-5 py-10 text-center text-sm text-ink-dim dark:text-ink-dark-dim">
            Loading sales…
          </div>
        )}
        {error && (
          <div className="px-5 py-10 text-center text-sm text-stock-out">
            Couldn't load sales: {error.message}
          </div>
        )}
        {!loading && !error && data?.sales?.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <BanknotesIcon className="h-8 w-8 text-ink-dim dark:text-ink-dark-dim" />
            <p className="text-sm text-ink-dim dark:text-ink-dark-dim">No sales recorded yet.</p>
          </div>
        )}
        {!loading && !error && data?.sales?.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-ink-dim dark:border-border-dark dark:text-ink-dark-dim">
                <tr>
                  <th className="px-5 py-3 font-medium">Receipt #</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Items</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Cashier</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-border-dark">
                {data.sales.map((s) => (
                  <tr
                    key={s.id}
                    className="cursor-pointer hover:bg-canvas dark:hover:bg-canvas-dark"
                    onClick={() => setDetail(s)}
                  >
                    <td className="figure px-5 py-3 text-ink dark:text-ink-dark">
                      {s.receiptNumber}
                    </td>
                    <td className="px-5 py-3 font-medium text-ink dark:text-ink-dark">
                      {s.customer?.fullName || "Walk-in"}
                    </td>
                    <td className="px-5 py-3 text-ink-dim dark:text-ink-dark-dim">
                      {s.items.length} item{s.items.length === 1 ? "" : "s"}
                    </td>
                    <td className="figure px-5 py-3 text-ink dark:text-ink-dark">
                      {currency(s.total)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={PAYMENT_TONE[s.paymentMethod]}>{s.paymentMethod}</Badge>
                    </td>
                    <td className="px-5 py-3 text-ink-dim dark:text-ink-dark-dim">
                      {s.cashier?.fullName || "—"}
                    </td>
                    <td className="px-5 py-3 text-ink-dim dark:text-ink-dark-dim">
                      {dateTimeShort(s.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-500 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          printReceipt(s);
                        }}
                      >
                        <PrinterIcon className="h-3.5 w-3.5" />
                        Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New sale" size="lg">
        <SaleForm
          customers={customers}
          products={products}
          submitting={creating}
          onCancel={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      </Modal>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.receiptNumber || "Sale detail"} size="md">
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-ink dark:text-ink-dark">
                  {detail.customer?.fullName || "Walk-in customer"}
                </p>
                <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                  {dateTimeShort(detail.createdAt)}
                </p>
              </div>
              <Badge tone={PAYMENT_TONE[detail.paymentMethod]}>{detail.paymentMethod}</Badge>
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
            <div className="space-y-1 border-t border-border pt-3 text-sm dark:border-border-dark">
              <div className="flex items-center justify-between text-ink-dim dark:text-ink-dark-dim">
                <span>Subtotal</span>
                <span className="figure">{currency(detail.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-ink-dim dark:text-ink-dark-dim">
                <span>Discount</span>
                <span className="figure">-{currency(detail.discount)}</span>
              </div>
              <div className="flex items-center justify-between text-ink-dim dark:text-ink-dark-dim">
                <span>Tax</span>
                <span className="figure">{currency(detail.tax)}</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold text-ink dark:text-ink-dark">
                <span>Total</span>
                <span className="figure">{currency(detail.total)}</span>
              </div>
              <div className="flex items-center justify-between text-ink-dim dark:text-ink-dark-dim">
                <span>Paid</span>
                <span className="figure">{currency(detail.amountPaid)}</span>
              </div>
              <div className="flex items-center justify-between text-ink-dim dark:text-ink-dark-dim">
                <span>Change</span>
                <span className="figure">{currency(detail.change)}</span>
              </div>
              {detail.order?.orderNumber && (
                <p className="pt-1 text-xs text-ink-dim dark:text-ink-dark-dim">
                  From online order {detail.order.orderNumber}
                </p>
              )}
            </div>
            <div className="flex justify-end pt-1">
              <button className="btn-secondary" onClick={() => printReceipt(detail)}>
                <PrinterIcon className="h-4 w-4" />
                Print receipt
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!justCompleted}
        onClose={() => setJustCompleted(null)}
        title="Sale successful"
        size="sm"
      >
        {justCompleted && (
          <div className="space-y-4 text-center">
            <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
              Receipt <span className="figure font-medium text-ink dark:text-ink-dark">{justCompleted.receiptNumber}</span>
            </p>
            <p className="figure text-2xl font-semibold text-ink dark:text-ink-dark">
              {currency(justCompleted.total)}
            </p>
            <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
              Change due: {currency(justCompleted.change)}
            </p>
            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
              <button className="btn-secondary" onClick={() => setDetail(justCompleted)}>
                View receipt
              </button>
              <button className="btn-secondary" onClick={() => printReceipt(justCompleted)}>
                <PrinterIcon className="h-4 w-4" />
                Print receipt
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  setJustCompleted(null);
                  setModalOpen(true);
                }}
              >
                New sale
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Sales;
