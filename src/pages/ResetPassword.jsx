import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { RESET_PASSWORD_MUTATION } from "../graphql/mutations/auth.js";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState("");
  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD_MUTATION);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  const onSubmit = async ({ password }) => {
    setSubmitError("");
    try {
      await resetPassword({ variables: { token, newPassword: password } });
      toast.success("Password reset. Please log in.");
      navigate("/login", { replace: true });
    } catch (err) {
      setSubmitError(err.message || "This reset link is invalid or has expired.");
    }
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">
        Choose a new password
      </h2>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label className="label" htmlFor="password">
            New password
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
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="input"
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

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Resetting…" : "Reset password"}
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

export default ResetPassword;
