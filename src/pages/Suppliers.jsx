import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { PlusIcon, PencilSquareIcon, TrashIcon, TruckIcon } from "@heroicons/react/24/outline";

import { SUPPLIERS_QUERY } from "../graphql/queries/suppliers.js";
import {
  CREATE_SUPPLIER_MUTATION,
  UPDATE_SUPPLIER_MUTATION,
  DELETE_SUPPLIER_MUTATION,
} from "../graphql/mutations/suppliers.js";
import Modal from "../components/ui/Modal.jsx";

const SupplierForm = ({ initial, onSubmit, submitting, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      companyName: initial?.companyName || "",
      contactPerson: initial?.contactPerson || "",
      phone: initial?.phone || "",
      email: initial?.email || "",
      address: initial?.address || "",
    },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label className="label" htmlFor="companyName">
          Company name
        </label>
        <input
          id="companyName"
          className="input"
          {...register("companyName", { required: "Company name is required" })}
        />
        {errors.companyName && <p className="field-error">{errors.companyName.message}</p>}
      </div>

      <div>
        <label className="label" htmlFor="contactPerson">
          Contact person
        </label>
        <input id="contactPerson" className="input" {...register("contactPerson")} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="phone">
            Phone
          </label>
          <input id="phone" className="input" {...register("phone")} />
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input"
            {...register("email", {
              pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
            })}
          />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="address">
          Address
        </label>
        <textarea id="address" rows={2} className="input" {...register("address")} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Saving…" : initial ? "Save changes" : "Create supplier"}
        </button>
      </div>
    </form>
  );
};

const Suppliers = () => {
  const { data, loading, error, refetch } = useQuery(SUPPLIERS_QUERY);
  const [createSupplier, { loading: creating }] = useMutation(CREATE_SUPPLIER_MUTATION);
  const [updateSupplier, { loading: updating }] = useMutation(UPDATE_SUPPLIER_MUTATION);
  const [deleteSupplier] = useMutation(DELETE_SUPPLIER_MUTATION);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (supplier) => {
    setEditing(supplier);
    setModalOpen(true);
  };

  const handleSubmit = async (input) => {
    try {
      if (editing) {
        await updateSupplier({ variables: { id: editing.id, input } });
        toast.success("Supplier updated.");
      } else {
        await createSupplier({ variables: { input } });
        toast.success("Supplier created.");
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.message || "Could not save supplier.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSupplier({ variables: { id } });
      toast.success("Supplier deleted.");
      setPendingDeleteId(null);
      refetch();
    } catch (err) {
      toast.error(err.message || "Could not delete supplier.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">
            Suppliers
          </h1>
          <p className="mt-1 text-sm text-ink-dim dark:text-ink-dark-dim">
            Vendors you purchase stock from.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <PlusIcon className="h-4 w-4" />
          New supplier
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading && (
          <div className="px-5 py-10 text-center text-sm text-ink-dim dark:text-ink-dark-dim">
            Loading suppliers…
          </div>
        )}
        {error && (
          <div className="px-5 py-10 text-center text-sm text-stock-out">
            Couldn't load suppliers: {error.message}
          </div>
        )}
        {!loading && !error && data?.suppliers?.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <TruckIcon className="h-8 w-8 text-ink-dim dark:text-ink-dark-dim" />
            <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
              No suppliers yet. Add one to start recording purchases.
            </p>
          </div>
        )}
        {!loading && !error && data?.suppliers?.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-ink-dim dark:border-border-dark dark:text-ink-dark-dim">
                <tr>
                  <th className="px-5 py-3 font-medium">Company</th>
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Products</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-border-dark">
                {data.suppliers.map((s) => (
                  <tr key={s.id}>
                    <td className="px-5 py-3 font-medium text-ink dark:text-ink-dark">
                      {s.companyName}
                    </td>
                    <td className="px-5 py-3 text-ink-dim dark:text-ink-dark-dim">
                      {s.contactPerson || "—"}
                    </td>
                    <td className="px-5 py-3 text-ink-dim dark:text-ink-dark-dim">
                      {s.phone || "—"}
                    </td>
                    <td className="px-5 py-3 text-ink-dim dark:text-ink-dark-dim">
                      {s.email || "—"}
                    </td>
                    <td className="figure px-5 py-3 text-ink dark:text-ink-dark">
                      {s.productCount}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {pendingDeleteId === s.id ? (
                          <span className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleDelete(s.id)}
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
                              onClick={() => openEdit(s)}
                              className="rounded-md p-1.5 text-ink-dim hover:bg-canvas hover:text-ink dark:text-ink-dark-dim dark:hover:bg-canvas-dark"
                              aria-label={`Edit ${s.companyName}`}
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setPendingDeleteId(s.id)}
                              className="rounded-md p-1.5 text-ink-dim hover:bg-canvas hover:text-stock-out dark:text-ink-dark-dim dark:hover:bg-canvas-dark"
                              aria-label={`Delete ${s.companyName}`}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit supplier" : "New supplier"}
      >
        <SupplierForm
          initial={editing}
          submitting={creating || updating}
          onCancel={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
};

export default Suppliers;
