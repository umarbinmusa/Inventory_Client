import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ email, password }) => {
    setSubmitError("");
    try {
      await login(email, password);
      toast.success("Welcome back.");
      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">
        Log in to your account
      </h2>
      <p className="mt-1.5 text-sm text-ink-dim dark:text-ink-dark-dim">
        Enter your email and password to continue.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="input"
            placeholder="you@company.com"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="label" htmlFor="password">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs font-medium text-brand-500 hover:text-brand-600">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="input"
            placeholder="••••••••"
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && <p className="field-error">{errors.password.message}</p>}
        </div>

        {submitError && (
          <p className="rounded-md bg-stock-out/10 px-3 py-2 text-sm text-stock-out">
            {submitError}
          </p>
        )}

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-dim dark:text-ink-dark-dim">
        Need an account?{" "}
        <Link to="/register" className="font-medium text-brand-500 hover:text-brand-600">
          Create one
        </Link>
      </p>
    </div>
  );
};

export default Login;
