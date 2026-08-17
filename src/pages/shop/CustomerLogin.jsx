import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

import { useCustomerAuth } from "../../context/CustomerAuthContext.jsx";

const CustomerLogin = () => {
  const { login } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submit = async (values) => {
    setSubmitting(true);
    try {
      await login(values.email, values.password);
      toast.success("Welcome back!");
      navigate(location.state?.from?.pathname || "/shop", { replace: true });
    } catch (err) {
      toast.error(err.message || "Couldn't log you in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">
          Log in
        </h1>
        <p className="mt-1 text-sm text-ink-dim dark:text-ink-dark-dim">
          Log in to check out faster and see your order history.
        </p>
      </div>

      <form onSubmit={handleSubmit(submit)} noValidate className="card space-y-4 p-5">
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input"
            {...register("email", { required: "Required" })}
          />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="input"
            {...register("password", { required: "Required" })}
          />
          {errors.password && <p className="field-error">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="text-center text-sm text-ink-dim dark:text-ink-dark-dim">
        Don't have an account?{" "}
        <Link to="/customer-register" className="font-medium text-brand-600 hover:underline dark:text-brand-300">
          Sign up
        </Link>
      </p>
      <p className="text-center text-xs text-ink-dim dark:text-ink-dark-dim">
        You can also{" "}
        <Link to="/cart" className="underline">
          check out as a guest
        </Link>{" "}
        without an account.
      </p>
    </div>
  );
};

export default CustomerLogin;
