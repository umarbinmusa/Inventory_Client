import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { ExclamationTriangleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

import { REORDER_REQUIRED_QUERY, REORDERS_QUERY } from "../graphql/queries/reorder.js";
import {
  CREATE_REORDER_MUTATION,
  UPDATE_REORDER_STATUS_MUTATION,
} from "../graphql/mutations/reorder.js";
import Modal from "../components/ui/Modal.jsx";
import Badge from "../components/ui/Badge.jsx";
import { dateTimeShort } from "../utils/format.js";

const REORDER_STATUS_TONE = { PENDING: "low", ORDERED: "brand", RECEIVED: "ok" };
const REORDER_NEXT = { PENDING: "ORDERED", ORDERED: "RECEIVED" };

const CreateReorderForm = ({ product, onSubmit, submitting, onCancel }) => {
  const suggested = Math.max(product.minimumStock * 2 - product.quantity, product.minimumStock, 1);
  const { register, handleSubmit } = useForm({
    defaultValues: { suggestedQuantity: suggested, notes: "" },
  });

  const submit = (values) => {
    onSubmit({
      productId: product.id,
      supplierId: product.supplier?.id || null,
      suggestedQuantity: Number(values.suggestedQuantity),
      notes: values.notes || "",
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
      <div className="rounded-md bg-canvas px-3 py-2 text-sm dark:bg-canvas-dark">
        <p className="font-medium text-ink dark:text-ink-dark">{product.productName}</p>
        <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
          {product.quantity} in stock · reorder level {product.minimumStock}
          {product.supplier?.companyName ? ` · ${product.supplier.companyName}` : ""}
        </p>
      </div>

      <div>
        <label className="label" htmlFor="suggestedQuantity">
          Quantity to reorder
        </label>
        <input
          id="suggestedQuantity"
          type="number"
          min="1"
          className="input"
          {...register("suggestedQuantity", { required: true, min: 1 })}
        />
      </div>

      <div>
        <label className="label" htmlFor="notes">
          Notes (optional)
        </label>
        <textarea id="notes" rows={2} className="input" {...register("notes")} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Saving…" : "Create reorder request"}
        </button>
      </div>
    </form>
  );
};

const Reorder = () => {
  const { data: requiredData, loading: requiredLoading, refetch: refetchRequired } =
    useQuery(REORDER_REQUIRED_QUERY);
  const { data: reordersData, loading: reordersLoading, refetch: refetchReorders } =
    useQuery(REORDERS_QUERY);

  const [createReorder, { loading: creating }] = useMutation(CREATE_REORDER_MUTATION);
  const [updateStatus] = useMutation(UPDATE_REORDER_STATUS_MUTATION);

  const [target, setTarget] = useState(null);

  const requiredProducts = useMemo(() => requiredData?.reorderRequired || [], [requiredData]);
  const reorders = useMemo(() => reordersData?.reorders || [], [reordersData]);

  const handleCreate = async (input) => {
    try {
      await createReorder({ variables: { input } });
      toast.success("Reorder request created.");
      setTarget(null);
      refetchReorders();
    } catch (err) {
      toast.error(err.message || "Could not create reorder request.");
    }
  };

  const handleAdvance = async (id, status) => {
    try {
      await updateStatus({ variables: { id, status } });
      toast.success(`Marked as ${status.toLowerCase()}.`);
      refetchReorders();
    } catch (err) {
      toast.error(err.message || "Could not update reorder status.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">Reorder</h1>
        <p className="mt-1 text-sm text-ink-dim dark:text-ink-dark-dim">
          Products at or below their reorder level, and requests already in progress.
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-border px-5 py-3 dark:border-border-dark">
          <h2 className="font-display text-sm font-semibold text-ink dark:text-ink-dark">
            Reorder Required
          </h2>
        </div>
        {requiredLoading && (
          <div className="px-5 py-8 text-center text-sm text-ink-dim dark:text-ink-dark-dim">
            Loading…
          </div>
        )}
        {!requiredLoading && requiredProducts.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
            <ExclamationTriangleIcon className="h-7 w-7 text-ink-dim dark:text-ink-dark-dim" />
            <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
              Nothing needs reordering right now.
            </p>
          </div>
        )}
        {!requiredLoading && requiredProducts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-ink-dim dark:border-border-dark dark:text-ink-dark-dim">
                <tr>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Reorder Level</th>
                  <th className="px-5 py-3 font-medium">Supplier</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-border-dark">
                {requiredProducts.map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-3 font-medium text-ink dark:text-ink-dark">
                      {p.productName}
                      <span className="ml-1.5 text-xs font-normal text-ink-dim dark:text-ink-dark-dim">
                        {p.sku}
                      </span>
                    </td>
                    <td className="figure px-5 py-3">{p.quantity}</td>
                    <td className="figure px-5 py-3">{p.minimumStock}</td>
                    <td className="px-5 py-3 text-ink-dim dark:text-ink-dark-dim">
                      {p.supplier?.companyName || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={p.quantity === 0 ? "out" : "low"}>
                        {p.quantity === 0 ? "Out of Stock" : "Low Stock"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button className="btn-secondary text-xs" onClick={() => setTarget(p)}>
                        Create reorder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-border px-5 py-3 dark:border-border-dark">
          <h2 className="font-display text-sm font-semibold text-ink dark:text-ink-dark">
            Reorder Requests
          </h2>
        </div>
        {reordersLoading && (
          <div className="px-5 py-8 text-center text-sm text-ink-dim dark:text-ink-dark-dim">
            Loading…
          </div>
        )}
        {!reordersLoading && reorders.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-ink-dim dark:text-ink-dark-dim">
            No reorder requests yet.
          </div>
        )}
        {!reordersLoading && reorders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-ink-dim dark:border-border-dark dark:text-ink-dark-dim">
                <tr>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Suggested Qty</th>
                  <th className="px-5 py-3 font-medium">Requested by</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-border-dark">
                {reorders.map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-3 font-medium text-ink dark:text-ink-dark">
                      {r.product?.productName}
                    </td>
                    <td className="figure px-5 py-3">{r.suggestedQuantity}</td>
                    <td className="px-5 py-3 text-ink-dim dark:text-ink-dark-dim">
                      {r.requestedBy?.fullName || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={REORDER_STATUS_TONE[r.status]}>{r.status}</Badge>
                    </td>
                    <td className="px-5 py-3 text-ink-dim dark:text-ink-dark-dim">
                      {dateTimeShort(r.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {REORDER_NEXT[r.status] && (
                        <button
                          className="inline-flex items-center gap-1 text-xs font-medium text-brand-500 hover:underline"
                          onClick={() => handleAdvance(r.id, REORDER_NEXT[r.status])}
                        >
                          <ArrowPathIcon className="h-3.5 w-3.5" />
                          Mark {REORDER_NEXT[r.status].toLowerCase()}
                        </button>
                      )}
                      {r.status === "RECEIVED" && (
                        <span className="text-xs text-ink-dim dark:text-ink-dark-dim">
                          Add stock from the Products page
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!target} onClose={() => setTarget(null)} title="Create reorder request" size="sm">
        {target && (
          <CreateReorderForm
            product={target}
            submitting={creating}
            onCancel={() => setTarget(null)}
            onSubmit={handleCreate}
          />
        )}
      </Modal>
    </div>
  );
};

export default Reorder;
