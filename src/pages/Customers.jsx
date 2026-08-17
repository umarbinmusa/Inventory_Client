import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { PlusIcon, PencilSquareIcon, TrashIcon, UsersIcon } from "@heroicons/react/24/outline";

import { CUSTOMERS_QUERY } from "../graphql/queries/customers.js";
import {
  CREATE_CUSTOMER_MUTATION,
  UPDATE_CUSTOMER_MUTATION,
  DELETE_CUSTOMER_MUTATION,
} from "../graphql/mutations/customers.js";
import Modal from "../components/ui/Modal.jsx";

const CustomerForm = ({ initial, onSubmit, submitting, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: initial?.fullName || "",
      phone: initial?.phone || "",
      email: initial?.email || "",
      address: initial?.address || "",
    },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label className="label" htmlFor="fullName">
          Full name
        </label>
        <input
          id="fullName"
          className="input"
          {...register("fullName", { required: "Full name is required" })}
        />
        {errors.fullName && <p className="field-error">{errors.fullName.message}</p>}
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
          {submitting ? "Saving…" : initial ? "Save changes" : "Create customer"}
        </button>
      </div>
    </form>
  );
};

const Customers = () => {
  const { data, loading, error, refetch } = useQuery(CUSTOMERS_QUERY);
  const [createCustomer, { loading: creating }] = useMutation(CREATE_CUSTOMER_MUTATION);
  const [updateCustomer, { loading: updating }] = useMutation(UPDATE_CUSTOMER_MUTATION);
  const [deleteCustomer] = useMutation(DELETE_CUSTOMER_MUTATION);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (customer) => {
    setEditing(customer);
    setModalOpen(true);
  };

  const handleSubmit = async (input) => {
    try {
      if (editing) {
        await updateCustomer({ variables: { id: editing.id, input } });
        toast.success("Customer updated.");
      } else {
        await createCustomer({ variables: { input } });
        toast.success("Customer created.");
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.message || "Could not save customer.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCustomer({ variables: { id } });
      toast.success("Customer deleted.");
      setPendingDeleteId(null);
      refetch();
    } catch (err) {
      toast.error(err.message || "Could not delete customer.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">
            Customers
          </h1>
          <p className="mt-1 text-sm text-ink-dim dark:text-ink-dark-dim">
            People and businesses you sell to.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <PlusIcon className="h-4 w-4" />
          New customer
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading && (
          <div className="px-5 py-10 text-center text-sm text-ink-dim dark:text-ink-dark-dim">
            Loading customers…
          </div>
        )}
        {error && (
          <div className="px-5 py-10 text-center text-sm text-stock-out">
            Couldn't load customers: {error.message}
          </div>
        )}
        {!loading && !error && data?.customers?.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <UsersIcon className="h-8 w-8 text-ink-dim dark:text-ink-dark-dim" />
            <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
              No customers yet. Add one to attach sales to a customer.
            </p>
          </div>
        )}
        {!loading && !error && data?.customers?.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-ink-dim dark:border-border-dark dark:text-ink-dark-dim">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Orders</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-border-dark">
                {data.customers.map((c) => (
                  <tr key={c.id}>
                    <td className="px-5 py-3 font-medium text-ink dark:text-ink-dark">
                      {c.fullName}
                    </td>
                    <td className="px-5 py-3 text-ink-dim dark:text-ink-dark-dim">
                      {c.phone || "—"}
                    </td>
                    <td className="px-5 py-3 text-ink-dim dark:text-ink-dark-dim">
                      {c.email || "—"}
                    </td>
                    <td className="figure px-5 py-3 text-ink dark:text-ink-dark">
                      {c.orderCount}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {pendingDeleteId === c.id ? (
                          <span className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleDelete(c.id)}
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
                              onClick={() => openEdit(c)}
                              className="rounded-md p-1.5 text-ink-dim hover:bg-canvas hover:text-ink dark:text-ink-dark-dim dark:hover:bg-canvas-dark"
                              aria-label={`Edit ${c.fullName}`}
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setPendingDeleteId(c.id)}
                              className="rounded-md p-1.5 text-ink-dim hover:bg-canvas hover:text-stock-out dark:text-ink-dark-dim dark:hover:bg-canvas-dark"
                              aria-label={`Delete ${c.fullName}`}
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
        title={editing ? "Edit customer" : "New customer"}
      >
        <CustomerForm
          initial={editing}
          submitting={creating || updating}
          onCancel={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
};

export default Customers;
