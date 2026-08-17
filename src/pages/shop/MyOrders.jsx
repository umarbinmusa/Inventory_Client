import { useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

import { MY_ORDERS_QUERY } from "../../graphql/queries/customerAuth.js";
import { currency, dateTimeShort } from "../../utils/format.js";

const STATUS_TONE_CLASS = {
  PENDING: "bg-stock-low/10 text-stock-low",
  CONFIRMED: "bg-brand-500/10 text-brand-600 dark:text-brand-300",
  PROCESSING: "bg-brand-500/10 text-brand-600 dark:text-brand-300",
  READY: "bg-stock-ok/10 text-stock-ok",
  COMPLETED: "bg-stock-ok/10 text-stock-ok",
  CANCELLED: "bg-stock-out/10 text-stock-out",
};

const MyOrders = () => {
  const { data, loading, error } = useQuery(MY_ORDERS_QUERY, { fetchPolicy: "network-only" });
  const orders = data?.myOrders || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">My orders</h1>
        <p className="mt-1 text-sm text-ink-dim dark:text-ink-dark-dim">
          Everything you've booked, in one place.
        </p>
      </div>

      {loading && (
        <div className="card px-5 py-10 text-center text-sm text-ink-dim dark:text-ink-dark-dim">
          Loading your orders…
        </div>
      )}

      {error && (
        <div className="card px-5 py-10 text-center text-sm text-stock-out">
          Couldn't load your orders: {error.message}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="card flex flex-col items-center gap-3 px-5 py-16 text-center">
          <ClipboardDocumentListIcon className="h-9 w-9 text-ink-dim dark:text-ink-dark-dim" />
          <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
            You haven't placed any orders yet.
          </p>
          <Link to="/shop" className="btn-primary">
            Browse products
          </Link>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              to={`/track-order?orderNumber=${o.orderNumber}`}
              className="card flex flex-col gap-2 p-4 transition-colors hover:border-brand-300 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="figure text-sm font-semibold text-ink dark:text-ink-dark">
                  {o.orderNumber}
                </p>
                <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                  {dateTimeShort(o.createdAt)} · {o.items.length} item{o.items.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="figure text-sm font-medium text-ink dark:text-ink-dark">
                  {currency(o.total)}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_TONE_CLASS[o.status]}`}
                >
                  {o.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
