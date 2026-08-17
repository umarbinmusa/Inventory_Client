import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

/**
 * Wrap a nested <Route> with this to restrict it to specific roles, e.g.:
 * <Route element={<RoleRoute allow={[ROLES.ADMIN, ROLES.MANAGER]} />}>
 *   <Route path="/users" element={<UsersPage />} />
 * </Route>
 */
const RoleRoute = ({ allow = [] }) => {
  const { user } = useAuth();

  if (!user || !allow.includes(user.role)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <ExclamationTriangleIcon className="h-10 w-10 text-stock-low" />
        <h2 className="font-display text-lg font-semibold text-ink dark:text-ink-dark">
          You don't have access to this page
        </h2>
        <p className="max-w-sm text-sm text-ink-dim dark:text-ink-dark-dim">
          This section is restricted to certain roles. Contact an administrator if you believe
          this is a mistake.
        </p>
      </div>
    );
  }

  return <Outlet />;
};

export default RoleRoute;
