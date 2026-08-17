import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { TrashIcon } from "@heroicons/react/24/outline";
import { USERS_QUERY } from "../graphql/queries/auth.js";
import {
  UPDATE_USER_STATUS_MUTATION,
  DELETE_USER_MUTATION,
} from "../graphql/mutations/users.js";
import { ROLES, ROLE_LABELS } from "../utils/roles.js";
import { useAuth } from "../context/AuthContext.jsx";

const Settings = () => {
  const { user: currentUser } = useAuth();
  const { data, loading, error, refetch } = useQuery(USERS_QUERY);
  const [updateUserStatus] = useMutation(UPDATE_USER_STATUS_MUTATION);
  const [deleteUser] = useMutation(DELETE_USER_MUTATION);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const handleRoleChange = async (id, role) => {
    try {
      await updateUserStatus({ variables: { id, role } });
      toast.success("Role updated.");
      refetch();
    } catch (err) {
      toast.error(err.message || "Could not update role.");
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      await updateUserStatus({ variables: { id, isActive: !isActive } });
      toast.success(!isActive ? "User activated." : "User deactivated.");
      refetch();
    } catch (err) {
      toast.error(err.message || "Could not update user.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser({ variables: { id } });
      toast.success("User deleted.");
      setPendingDeleteId(null);
      refetch();
    } catch (err) {
      toast.error(err.message || "Could not delete user.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">
          Settings
        </h1>
        <p className="mt-1 text-sm text-ink-dim dark:text-ink-dark-dim">
          Manage who has access to this system and what they can do.
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-border px-5 py-4 dark:border-border-dark">
          <h2 className="font-display text-sm font-semibold text-ink dark:text-ink-dark">
            Team members
          </h2>
        </div>

        {loading && (
          <div className="px-5 py-8 text-center text-sm text-ink-dim dark:text-ink-dark-dim">
            Loading team members…
          </div>
        )}

        {error && (
          <div className="px-5 py-8 text-center text-sm text-stock-out">
            Couldn't load users: {error.message}
          </div>
        )}

        {data?.users && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-ink-dim dark:border-border-dark dark:text-ink-dark-dim">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-border-dark">
                {data.users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-5 py-3 font-medium text-ink dark:text-ink-dark">
                      {u.fullName}
                      {u.id === currentUser?.id && (
                        <span className="ml-2 rounded bg-canvas px-1.5 py-0.5 text-[10px] uppercase text-ink-dim dark:bg-canvas-dark dark:text-ink-dark-dim">
                          You
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-ink-dim dark:text-ink-dark-dim">{u.email}</td>
                    <td className="px-5 py-3">
                      <select
                        value={u.role}
                        disabled={u.id === currentUser?.id}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="rounded-md border border-border bg-surface px-2 py-1 text-xs disabled:opacity-50 dark:border-border-dark dark:bg-surface-dark dark:text-ink-dark"
                      >
                        {Object.values(ROLES).map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleToggleActive(u.id, u.isActive)}
                        disabled={u.id === currentUser?.id}
                        className={`rounded-full px-2 py-0.5 text-xs font-medium disabled:opacity-50 ${
                          u.isActive
                            ? "bg-stock-ok/10 text-stock-ok"
                            : "bg-stock-out/10 text-stock-out"
                        }`}
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {pendingDeleteId === u.id ? (
                        <span className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(u.id)}
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
                        <button
                          onClick={() => setPendingDeleteId(u.id)}
                          disabled={u.id === currentUser?.id}
                          className="rounded-md p-1.5 text-ink-dim hover:bg-canvas hover:text-stock-out disabled:opacity-30 dark:text-ink-dark-dim dark:hover:bg-canvas-dark"
                          aria-label={`Delete ${u.fullName}`}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
