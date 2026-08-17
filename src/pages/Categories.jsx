import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { PlusIcon, PencilSquareIcon, TrashIcon, TagIcon } from "@heroicons/react/24/outline";

import { CATEGORIES_QUERY } from "../graphql/queries/categories.js";
import {
  CREATE_CATEGORY_MUTATION,
  UPDATE_CATEGORY_MUTATION,
  DELETE_CATEGORY_MUTATION,
} from "../graphql/mutations/categories.js";
import Modal from "../components/ui/Modal.jsx";
import { dateShort } from "../utils/format.js";

const CategoryForm = ({ initial, onSubmit, submitting, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { name: initial?.name || "", description: initial?.description || "" },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label className="label" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          className="input"
          {...register("name", { required: "Category name is required" })}
        />
        {errors.name && <p className="field-error">{errors.name.message}</p>}
      </div>

      <div>
        <label className="label" htmlFor="description">
          Description
        </label>
        <textarea id="description" rows={3} className="input" {...register("description")} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Saving…" : initial ? "Save changes" : "Create category"}
        </button>
      </div>
    </form>
  );
};

const Categories = () => {
  const { data, loading, error, refetch } = useQuery(CATEGORIES_QUERY);
  const [createCategory, { loading: creating }] = useMutation(CREATE_CATEGORY_MUTATION);
  const [updateCategory, { loading: updating }] = useMutation(UPDATE_CATEGORY_MUTATION);
  const [deleteCategory] = useMutation(DELETE_CATEGORY_MUTATION);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setModalOpen(true);
  };

  const handleSubmit = async (input) => {
    try {
      if (editing) {
        await updateCategory({ variables: { id: editing.id, input } });
        toast.success("Category updated.");
      } else {
        await createCategory({ variables: { input } });
        toast.success("Category created.");
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.message || "Could not save category.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory({ variables: { id } });
      toast.success("Category deleted.");
      setPendingDeleteId(null);
      refetch();
    } catch (err) {
      toast.error(err.message || "Could not delete category.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">
            Categories
          </h1>
          <p className="mt-1 text-sm text-ink-dim dark:text-ink-dark-dim">
            Group products so they're easy to find and report on.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <PlusIcon className="h-4 w-4" />
          New category
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading && (
          <div className="px-5 py-10 text-center text-sm text-ink-dim dark:text-ink-dark-dim">
            Loading categories…
          </div>
        )}
        {error && (
          <div className="px-5 py-10 text-center text-sm text-stock-out">
            Couldn't load categories: {error.message}
          </div>
        )}
        {!loading && !error && data?.categories?.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <TagIcon className="h-8 w-8 text-ink-dim dark:text-ink-dark-dim" />
            <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
              No categories yet. Create your first one to start organizing products.
            </p>
          </div>
        )}
        {!loading && !error && data?.categories?.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-ink-dim dark:border-border-dark dark:text-ink-dark-dim">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium">Products</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-border-dark">
                {data.categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="px-5 py-3 font-medium text-ink dark:text-ink-dark">
                      {cat.name}
                    </td>
                    <td className="max-w-xs truncate px-5 py-3 text-ink-dim dark:text-ink-dark-dim">
                      {cat.description || "—"}
                    </td>
                    <td className="figure px-5 py-3 text-ink dark:text-ink-dark">
                      {cat.productCount}
                    </td>
                    <td className="px-5 py-3 text-ink-dim dark:text-ink-dark-dim">
                      {dateShort(cat.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {pendingDeleteId === cat.id ? (
                          <span className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleDelete(cat.id)}
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
                              onClick={() => openEdit(cat)}
                              className="rounded-md p-1.5 text-ink-dim hover:bg-canvas hover:text-ink dark:text-ink-dark-dim dark:hover:bg-canvas-dark"
                              aria-label={`Edit ${cat.name}`}
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setPendingDeleteId(cat.id)}
                              className="rounded-md p-1.5 text-ink-dim hover:bg-canvas hover:text-stock-out dark:text-ink-dark-dim dark:hover:bg-canvas-dark"
                              aria-label={`Delete ${cat.name}`}
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
        title={editing ? "Edit category" : "New category"}
      >
        <CategoryForm
          initial={editing}
          submitting={creating || updating}
          onCancel={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
};

export default Categories;
