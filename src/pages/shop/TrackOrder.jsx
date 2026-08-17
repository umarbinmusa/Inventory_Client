import { useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { useSearchParams } from "react-router-dom";
import { MagnifyingGlassIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

import { TRACK_ORDER_QUERY } from "../../graphql/queries/orders.js";
import { currency, dateTimeShort } from "../../utils/format.js";

const STEPS = ["PENDING", "CONFIRMED", "PROCESSING", "READY", "COMPLETED"];
const STEP_LABEL = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  READY: "Ready",
  COMPLETED: "Completed",
};

const StatusProgress = ({ status }) => {
  if (status === "CANCELLED") {
    return (
      <div className="rounded-md bg-stock-out/10 px-4 py-3 text-center text-sm font-medium text-stock-out">
        This order was cancelled.
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => (
        <div key={step} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                i <= currentIndex
                  ? "bg-brand-500 text-white"
                  : "bg-canvas text-ink-dim dark:bg-canvas-dark dark:text-ink-dark-dim"
              }`}
            >
              {i < currentIndex ? <CheckCircleIcon className="h-5 w-5" /> : i + 1}
            </div>
            <span className="text-[10px] font-medium text-ink-dim dark:text-ink-dark-dim">
              {STEP_LABEL[step]}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`mx-1 h-0.5 flex-1 ${
                i < currentIndex ? "bg-brand-500" : "bg-border dark:bg-border-dark"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get("orderNumber") || "");
  const [runQuery, { data, loading, called }] = useLazyQuery(TRACK_ORDER_QUERY);

  const order = data?.trackOrder;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    runQuery({ variables: { orderNumber: orderNumber.trim() } });
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">Track order</h1>
        <p className="mt-1 text-sm text-ink-dim dark:text-ink-dark-dim">
          Enter your order number to see its current status.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dim dark:text-ink-dark-dim" />
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. ORD-20260813-001"
            className="input pl-9"
          />
        </div>
        <button type="submit" className="btn-primary">
          Track
        </button>
      </form>

      {loading && (
        <div className="card px-5 py-10 text-center text-sm text-ink-dim dark:text-ink-dark-dim">
          Looking up your order…
        </div>
      )}

      {called && !loading && !order && (
        <div className="card px-5 py-10 text-center text-sm text-stock-out">
          No order found with that number.
        </div>
      )}

      {order && (
        <div className="card space-y-5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="figure text-sm font-semibold text-ink dark:text-ink-dark">
                {order.orderNumber}
              </p>
              <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                Placed {dateTimeShort(order.createdAt)}
              </p>
            </div>
            <span className="figure text-sm font-semibold text-ink dark:text-ink-dark">
              {currency(order.total)}
            </span>
          </div>

          <StatusProgress status={order.status} />

          <div className="space-y-2 border-t border-border pt-4 dark:border-border-dark">
            {order.items.map((it, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-ink dark:text-ink-dark">
                  {it.product?.productName} × {it.quantity}
                </span>
                <span className="figure text-ink-dim dark:text-ink-dark-dim">
                  {currency(it.price * it.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
