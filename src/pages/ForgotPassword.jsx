import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { FORGOT_PASSWORD_MUTATION } from "../graphql/mutations/auth.js";

const ForgotPassword = () => {
  const [sent, setSent] = useState(false);
  const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD_MUTATION);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async ({ email }) => {
    await forgotPassword({ variables: { email } });
    // Backend intentionally always returns success to avoid leaking which
    // emails are registered, so we show the same message either way.
    setSent(true);
  };

  if (sent) {
    return (
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">
          Check your email
        </h2>
        <p className="mt-3 text-sm text-ink-dim dark:text-ink-dark-dim">
          If an account exists for that email, we've sent a link to reset your password. It
          expires in 30 minutes.
        </p>
        <Link to="/login" className="mt-6 inline-block text-sm font-medium text-brand-500 hover:text-brand-600">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">
        Reset your password
      </h2>
      <p className="mt-1.5 text-sm text-ink-dim dark:text-ink-dark-dim">
        Enter your email and we'll send you a reset link.
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

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-dim dark:text-ink-dark-dim">
        <Link to="/login" className="font-medium text-brand-500 hover:text-brand-600">
          Back to log in
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
