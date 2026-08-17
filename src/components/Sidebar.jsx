import { NavLink } from "react-router-dom";
import {
  Squares2X2Icon,
  CubeIcon,
  TagIcon,
  TruckIcon,
  UsersIcon,
  ShoppingCartIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext.jsx";
import { ROLES } from "../utils/roles.js";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard", icon: Squares2X2Icon, live: true },
  { label: "Products", to: "/products", icon: CubeIcon, live: true },
  { label: "Categories", to: "/categories", icon: TagIcon, live: true },
  { label: "Suppliers", to: "/suppliers", icon: TruckIcon, live: true },
  { label: "Customers", to: "/customers", icon: UsersIcon, live: true },
  { label: "Purchases", to: "/purchases", icon: ShoppingCartIcon, live: true },
  { label: "Sales", to: "/sales", icon: BanknotesIcon, live: true },
  { label: "Online Orders", to: "/orders", icon: ClipboardDocumentListIcon, live: true },
  { label: "Reorder", to: "/reorder", icon: ArrowPathIcon, live: true },
  { label: "Reports", to: "/reports", icon: ChartBarIcon, live: true },
];

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface transition-transform dark:border-border-dark dark:bg-surface-dark lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:z-auto`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-border px-5 dark:border-border-dark">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-500 font-display text-sm font-bold text-white">
            L
          </div>
          <span className="font-display text-base font-semibold text-ink dark:text-ink-dark">
            Ledger
          </span>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map(({ label, to, icon: Icon, live }) => {
            if (!live) {
              return (
                <div
                  key={label}
                  className="flex cursor-not-allowed items-center justify-between rounded-md px-3 py-2 text-sm text-ink-dim opacity-60 dark:text-ink-dark-dim"
                  title="This module hasn't been built yet"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    {label}
                  </span>
                  <span className="rounded bg-canvas px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-dim dark:bg-canvas-dark dark:text-ink-dark-dim">
                    Soon
                  </span>
                </div>
              );
            }

            return (
              <NavLink
                key={label}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                      : "text-ink-dim hover:bg-canvas hover:text-ink dark:text-ink-dark-dim dark:hover:bg-canvas-dark dark:hover:text-ink-dark"
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            );
          })}

          {user?.role === ROLES.ADMIN && (
            <NavLink
              to="/settings"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                    : "text-ink-dim hover:bg-canvas hover:text-ink dark:text-ink-dark-dim dark:hover:bg-canvas-dark dark:hover:text-ink-dark"
                }`
              }
            >
              <Cog6ToothIcon className="h-5 w-5" />
              Settings
            </NavLink>
          )}
        </nav>

        <div className="border-t border-border p-3 text-xs text-ink-dim dark:border-border-dark dark:text-ink-dark-dim">
          Inventory Management System · v1.0
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
