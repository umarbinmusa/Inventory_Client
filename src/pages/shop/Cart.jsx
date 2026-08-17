import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { TrashIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";

import { PLACE_ORDER_MUTATION } from "../../graphql/mutations/orders.js";
import { useCart } from "../../context/CartContext.jsx";
import { useCustomerAuth } from "../../context/CustomerAuthContext.jsx";
import { currency } from "../../utils/format.js";

const Cart = () => {
  const { items, updateQuantity, removeItem, clearCart, subtotal } = useCart();
  const { customer, isAuthenticated } = useCustomerAuth();
  const [placeOrder, { loading }] = useMutation(PLACE_ORDER_MUTATION);
  const [placedOrder, setPlacedOrder] = useState(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { customerName: "", customerPhone: "", customerEmail: "", customerAddress: "", notes: "" },
  });

  // Once we know who's logged in, prefill (and, below, hide) the contact
  // fields - placeOrder falls back to the logged-in customer's saved
  // details server-side for anything left blank, but prefilling here means
  // returning customers see their own info rather than empty boxes.
  useEffect(() => {
    if (isAuthenticated && customer) {
      reset({
        customerName: customer.fullName || "",
        customerPhone: customer.phone || "",
        customerEmail: customer.email || "",
        customerAddress: customer.address || "",
        notes: "",
      });
    }
  }, [isAuthenticated, customer, reset]);

  const submit = async (values) => {
    if (items.length === 0) return;
    try {
      const res = await placeOrder({
        variables: {
          input: {
            ...values,
            items: items.map((it) => ({ productId: it.productId, quantity: it.quantity })),
          },
        },
      });
      setPlacedOrder(res.data.placeOrder);
      clearCart();
    } catch (err) {
      toast.error(err.message || "Couldn't place your order. Please check stock and try again.");
    }
  };

  if (placedOrder) {
    return (
      <div className="card mx-auto max-w-md space-y-4 p-6 text-center">
        <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">
          Order placed!
        </h1>
        <p className="text-sm text-ink-dim dark:text-ink-dark-dim">
          Keep this order number to track your booking:
        </p>
        <p className="figure rounded-md bg-canvas px-4 py-3 text-lg font-semibold text-brand-600 dark:bg-canvas-dark dark:text-brand-300">
          {placedOrder.orderNumber}
        </p>
        <p className="figure text-sm text-ink-dim dark:text-ink-dark-dim">
          Total: {currency(placedOrder.total)}
        </p>
        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
          <Link to={`/track-order?orderNumber=${placedOrder.orderNumber}`} className="btn-secondary">
            Track this order
          </Link>
          <Link to="/shop" className="btn-primary">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-3 px-5 py-16 text-center">
        <ShoppingBagIcon className="h-10 w-10 text-ink-dim dark:text-ink-dark-dim" />
        <p className="text-sm text-ink-dim dark:text-ink-dark-dim">Your cart is empty.</p>
        <Link to="/shop" className="btn-primary">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">Your cart</h1>
        {items.map((it) => (
          <div key={it.productId} className="card flex items-center gap-3 p-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-ink dark:text-ink-dark">{it.productName}</p>
              <p className="figure text-xs text-ink-dim dark:text-ink-dark-dim">{currency(it.price)} each</p>
            </div>
            <div className="flex items-center rounded-md border border-border dark:border-border-dark">
              <button
                className="px-2.5 py-1 text-ink-dim hover:text-ink dark:text-ink-dark-dim dark:hover:text-ink-dark"
                onClick={() => updateQuantity(it.productId, it.quantity - 1)}
              >
                −
              </button>
              <span className="figure w-8 text-center text-sm">{it.quantity}</span>
              <button
                className="px-2.5 py-1 text-ink-dim hover:text-ink dark:text-ink-dark-dim dark:hover:text-ink-dark disabled:opacity-30"
                disabled={it.quantity >= it.maxQty}
                onClick={() => updateQuantity(it.productId, it.quantity + 1)}
              >
                +
              </button>
            </div>
            <span className="figure w-20 text-right text-sm font-medium text-ink dark:text-ink-dark">
              {currency(it.price * it.quantity)}
            </span>
            <button
              className="p-1.5 text-ink-dim hover:text-stock-out dark:text-ink-dark-dim"
              onClick={() => removeItem(it.productId)}
              aria-label="Remove"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(submit)} noValidate className="card h-fit space-y-4 p-5">
        <h2 className="font-display text-sm font-semibold text-ink dark:text-ink-dark">
          Your details
        </h2>

        {isAuthenticated ? (
          <div className="space-y-3">
            <div className="rounded-md bg-canvas px-3 py-2.5 text-sm dark:bg-canvas-dark">
              <p className="font-medium text-ink dark:text-ink-dark">{customer?.fullName}</p>
              <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
                {customer?.phone}
                {customer?.email ? ` · ${customer.email}` : ""}
              </p>
            </div>
            {/* Kept in the form (hidden) so the same submit payload works whether
                you're logged in or a guest - values were prefilled by the effect above. */}
            <input type="hidden" {...register("customerName")} />
            <input type="hidden" {...register("customerPhone")} />
            <input type="hidden" {...register("customerEmail")} />

            <div>
              <label className="label" htmlFor="customerAddress">
                Address / location (optional)
              </label>
              <input id="customerAddress" className="input" {...register("customerAddress")} />
            </div>
          </div>
        ) : (
          <>
            <div>
              <label className="label" htmlFor="customerName">
                Full name
              </label>
              <input
                id="customerName"
                className="input"
                {...register("customerName", { required: "Required" })}
              />
              {errors.customerName && <p className="field-error">{errors.customerName.message}</p>}
            </div>

            <div>
              <label className="label" htmlFor="customerPhone">
                Phone number
              </label>
              <input
                id="customerPhone"
                className="input"
                {...register("customerPhone", { required: "Required" })}
              />
              {errors.customerPhone && <p className="field-error">{errors.customerPhone.message}</p>}
            </div>

            <div>
              <label className="label" htmlFor="customerEmail">
                Email (optional)
              </label>
              <input id="customerEmail" type="email" className="input" {...register("customerEmail")} />
            </div>

            <div>
              <label className="label" htmlFor="customerAddress">
                Address / location (optional)
              </label>
              <input id="customerAddress" className="input" {...register("customerAddress")} />
            </div>

            <p className="text-xs text-ink-dim dark:text-ink-dark-dim">
              <Link to="/customer-login" className="font-medium text-brand-600 hover:underline dark:text-brand-300">
                Log in
              </Link>{" "}
              for faster checkout next time, or continue as a guest below.
            </p>
          </>
        )}

        <div>
          <label className="label" htmlFor="notes">
            Notes (optional)
          </label>
          <textarea id="notes" rows={2} className="input" {...register("notes")} />
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold text-ink dark:border-border-dark dark:text-ink-dark">
          <span>Total</span>
          <span className="figure">{currency(subtotal)}</span>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Placing order…" : "Place Order"}
        </button>
      </form>
    </div>
  );
};

export default Cart;
