import { Link, NavLink, Outlet } from "react-router-dom";
import { ShoppingBagIcon, MagnifyingGlassCircleIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useCart } from "../context/CartContext.jsx";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";

const NAV_LINK_CLASS = ({ isActive }) =>
  `text-sm font-medium transition-colors ${
    isActive ? "text-brand-600 dark:text-brand-300" : "text-ink-dim hover:text-ink dark:text-ink-dark-dim dark:hover:text-ink-dark"
  }`;

const ShopLayout = () => {
  const { itemCount } = useCart();
  const { customer, isAuthenticated, logout } = useCustomerAuth();

  return (
    <div className="flex min-h-screen flex-col bg-canvas dark:bg-canvas-dark">
      <header className="sticky top-0 z-20 border-b border-border bg-surface dark:border-border-dark dark:bg-surface-dark">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-4 sm:px-6">
          <Link to="/shop" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-500 font-display text-sm font-bold text-white">
              L
            </div>
            <span className="font-display text-base font-semibold text-ink dark:text-ink-dark">
              Ledger Shop
            </span>
          </Link>

          <nav className="ml-4 hidden items-center gap-5 sm:flex">
            <NavLink to="/shop" end className={NAV_LINK_CLASS}>
              Products
            </NavLink>
            <NavLink to="/track-order" className={NAV_LINK_CLASS}>
              Track Order
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/my-orders" className={NAV_LINK_CLASS}>
                My Orders
              </NavLink>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <Link
              to="/track-order"
              className="rounded-md p-2 text-ink-dim hover:bg-canvas dark:text-ink-dark-dim dark:hover:bg-canvas-dark sm:hidden"
              aria-label="Track order"
            >
              <MagnifyingGlassCircleIcon className="h-5 w-5" />
            </Link>
            <Link
              to="/cart"
              className="relative rounded-md p-2 text-ink-dim hover:bg-canvas dark:text-ink-dark-dim dark:hover:bg-canvas-dark"
              aria-label="Cart"
            >
              <ShoppingBagIcon className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-semibold text-white">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="group relative">
                <button
                  className="flex items-center gap-1.5 rounded-md p-2 text-ink-dim hover:bg-canvas dark:text-ink-dark-dim dark:hover:bg-canvas-dark"
                  aria-label="Account"
                >
                  <UserCircleIcon className="h-5 w-5" />
                  <span className="hidden max-w-[8rem] truncate text-sm font-medium text-ink dark:text-ink-dark sm:inline">
                    {customer?.fullName?.split(" ")[0]}
                  </span>
                </button>
                <div className="invisible absolute right-0 z-30 mt-1 w-40 rounded-md border border-border bg-surface py-1 opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100 dark:border-border-dark dark:bg-surface-dark">
                  <Link
                    to="/my-orders"
                    className="block px-3 py-2 text-sm text-ink hover:bg-canvas dark:text-ink-dark dark:hover:bg-canvas-dark sm:hidden"
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full px-3 py-2 text-left text-sm text-stock-out hover:bg-canvas dark:hover:bg-canvas-dark"
                  >
                    Log out
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/customer-login" className="btn-secondary px-3 py-1.5 text-xs">
                Log in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <Outlet />
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-ink-dim dark:border-border-dark dark:text-ink-dark-dim">
        Browse products, book what you need, and pick it up in store.
      </footer>
    </div>
  );
};

export default ShopLayout;
