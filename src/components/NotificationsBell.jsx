import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { BellIcon } from "@heroicons/react/24/outline";
import {
  NOTIFICATIONS_QUERY,
  UNREAD_NOTIFICATION_COUNT_QUERY,
} from "../graphql/queries/notifications.js";
import {
  MARK_NOTIFICATION_READ_MUTATION,
  MARK_ALL_NOTIFICATIONS_READ_MUTATION,
} from "../graphql/mutations/notifications.js";
import { dateTimeShort } from "../utils/format.js";

const TYPE_LABEL = {
  LOW_STOCK: "Low stock",
  OUT_OF_STOCK: "Out of stock",
  EXPIRING_PRODUCT: "Expiring soon",
  NEW_ORDER: "New sale",
  NEW_BOOKING: "New online order",
  BOOKING_CANCELLED: "Order cancelled",
};

const NotificationsBell = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const { data: countData, refetch: refetchCount } = useQuery(UNREAD_NOTIFICATION_COUNT_QUERY, {
    pollInterval: 60000,
  });
  const { data, loading, refetch } = useQuery(NOTIFICATIONS_QUERY, {
    skip: !open,
    fetchPolicy: "network-only",
  });
  const [markRead] = useMutation(MARK_NOTIFICATION_READ_MUTATION);
  const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ_MUTATION);

  const unreadCount = countData?.unreadNotificationCount || 0;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markRead({ variables: { id } });
      refetch();
      refetchCount();
    } catch {
      // best-effort
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      refetch();
      refetchCount();
    } catch {
      // best-effort
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-md p-2 text-ink-dim hover:bg-canvas dark:text-ink-dark-dim dark:hover:bg-canvas-dark"
        aria-label="Notifications"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-stock-out px-1 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-md border border-border bg-surface shadow-card dark:border-border-dark dark:bg-surface-dark">
          <div className="flex items-center justify-between border-b border-border px-4 py-3 dark:border-border-dark">
            <p className="text-sm font-semibold text-ink dark:text-ink-dark">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-brand-500 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <p className="px-4 py-6 text-center text-xs text-ink-dim dark:text-ink-dark-dim">
                Loading…
              </p>
            )}
            {!loading && data?.notifications?.length === 0 && (
              <p className="px-4 py-6 text-center text-xs text-ink-dim dark:text-ink-dark-dim">
                You're all caught up.
              </p>
            )}
            {!loading &&
              data?.notifications?.map((n) => (
                <div
                  key={n.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => !n.read && handleMarkRead(n.id)}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && !n.read) handleMarkRead(n.id);
                  }}
                  className={`block w-full border-b border-border px-4 py-3 text-left text-xs last:border-0 dark:border-border-dark ${
                    n.read ? "opacity-60" : "cursor-pointer hover:bg-canvas dark:hover:bg-canvas-dark"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-ink dark:text-ink-dark">
                      {TYPE_LABEL[n.type] || n.type}
                    </span>
                    {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />}
                  </div>
                  <p className="mt-1 text-ink-dim dark:text-ink-dark-dim">{n.message}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-[10px] text-ink-dim dark:text-ink-dark-dim">
                      {dateTimeShort(n.createdAt)}
                    </p>
                    {n.order?.id && (
                      <Link
                        to="/orders"
                        className="text-[10px] font-medium text-brand-500 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View order →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;
