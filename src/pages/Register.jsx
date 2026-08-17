import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.jsx";

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch("password");

  const onSubmit = async ({ fullName, email, password }) => {
    setSubmitError("");
    try {
      await registerUser({ fullName, email, password });
      toast.success("Account created. Welcome!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">
        Create your account
      </h2>
      <p className="mt-1.5 text-sm text-ink-dim dark:text-ink-dark-dim">
        The first account created becomes the system administrator.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label className="label" htmlFor="fullName">
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            className="input"
            placeholder="Ada Admin"
            {...register("fullName", { required: "Full name is required" })}
          />
          {errors.fullName && <p className="field-error">{errors.fullName.message}</p>}
        </div>

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
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="input"
            placeholder="At least 8 characters"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "Password must be at least 8 characters" },
            })}
          />
          {errors.password && <p className="field-error">{errors.password.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="confirmPassword">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="input"
            placeholder="Re-enter your password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) => value === password || "Passwords don't match",
            })}
          />
          {errors.confirmPassword && (
            <p className="field-error">{errors.confirmPassword.message}</p>
          )}
        </div>

        {submitError && (
          <p className="rounded-md bg-stock-out/10 px-3 py-2 text-sm text-stock-out">
            {submitError}
          </p>
        )}

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-dim dark:text-ink-dark-dim">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-brand-500 hover:text-brand-600">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default Register;
