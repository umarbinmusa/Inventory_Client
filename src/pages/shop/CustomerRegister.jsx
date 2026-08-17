import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useCustomerAuth } from "../../context/CustomerAuthContext.jsx";

const CustomerRegister = () => {
  const { register: registerCustomer } = useCustomerAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const submit = async (values) => {
    setSubmitting(true);
    try {
      await registerCustomer({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phone: values.phone || "",
        address: values.address || "",
      });
      toast.success("Account created!");
      navigate("/shop", { replace: true });
    } catch (err) {
      toast.error(err.message || "Couldn't create your account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">
          Create an account
        </h1>
        <p className="mt-1 text-sm text-ink-dim dark:text-ink-dark-dim">
          Save your details for faster checkout and track your orders in one place.
        </p>
      </div>

      <form onSubmit={handleSubmit(submit)} noValidate className="card space-y-4 p-5">
        <div>
          <label className="label" htmlFor="fullName">
            Full name
          </label>
          <input
            id="fullName"
            className="input"
            {...register("fullName", { required: "Required" })}
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
            className="input"
            {...register("email", { required: "Required" })}
          />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="phone">
            Phone (optional)
          </label>
          <input id="phone" className="input" {...register("phone")} />
        </div>

        <div>
          <label className="label" htmlFor="address">
            Address (optional)
          </label>
          <input id="address" className="input" {...register("address")} />
        </div>

        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="input"
            {...register("password", {
              required: "Required",
              minLength: { value: 8, message: "At least 8 characters" },
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
            className="input"
            {...register("confirmPassword", {
              required: "Required",
              validate: (v) => v === watch("password") || "Passwords don't match",
            })}
          />
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-ink-dim dark:text-ink-dark-dim">
        Already have an account?{" "}
        <Link to="/customer-login" className="font-medium text-brand-600 hover:underline dark:text-brand-300">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default CustomerRegister;
