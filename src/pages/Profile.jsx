import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.jsx";
import { UPDATE_PROFILE_MUTATION, CHANGE_PASSWORD_MUTATION } from "../graphql/mutations/auth.js";
import { ROLE_LABELS } from "../utils/roles.js";

const ProfileForm = () => {
  const { user, refetchCurrentUser } = useAuth();
  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE_MUTATION);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: { fullName: user?.fullName || "", phone: user?.phone || "" },
  });

  const onSubmit = async (input) => {
    try {
      await updateProfile({ variables: { input } });
      await refetchCurrentUser();
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err.message || "Could not update profile.");
    }
  };

  return (
    <form className="card space-y-4 p-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2 className="font-display text-base font-semibold text-ink dark:text-ink-dark">
        Profile details
      </h2>

      <div>
        <label className="label" htmlFor="fullName">
          Full name
        </label>
        <input
          id="fullName"
          className="input"
          {...register("fullName", { required: "Full name is required" })}
        />
        {errors.fullName && <p className="field-error">{errors.fullName.message}</p>}
      </div>

      <div>
        <label className="label" htmlFor="phone">
          Phone
        </label>
        <input id="phone" className="input" {...register("phone")} />
      </div>

      <div>
        <label className="label">Email</label>
        <input className="input opacity-60" value={user?.email || ""} disabled />
      </div>

      <div>
        <label className="label">Role</label>
        <input className="input opacity-60" value={ROLE_LABELS[user?.role] || ""} disabled />
      </div>

      <button type="submit" disabled={loading || !isDirty} className="btn-primary">
        {loading ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
};

const PasswordForm = () => {
  const [changePassword, { loading }] = useMutation(CHANGE_PASSWORD_MUTATION);
  const { logout } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const newPassword = watch("newPassword");

  const onSubmit = async ({ currentPassword, newPassword }) => {
    try {
      await changePassword({ variables: { input: { currentPassword, newPassword } } });
      toast.success("Password changed. Please log in again.");
      reset();
      await logout();
    } catch (err) {
      toast.error(err.message || "Could not change password.");
    }
  };

  return (
    <form className="card space-y-4 p-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2 className="font-display text-base font-semibold text-ink dark:text-ink-dark">
        Change password
      </h2>

      <div>
        <label className="label" htmlFor="currentPassword">
          Current password
        </label>
        <input
          id="currentPassword"
          type="password"
          className="input"
          {...register("currentPassword", { required: "Current password is required" })}
        />
        {errors.currentPassword && (
          <p className="field-error">{errors.currentPassword.message}</p>
        )}
      </div>

      <div>
        <label className="label" htmlFor="newPassword">
          New password
        </label>
        <input
          id="newPassword"
          type="password"
          className="input"
          {...register("newPassword", {
            required: "New password is required",
            minLength: { value: 8, message: "Password must be at least 8 characters" },
          })}
        />
        {errors.newPassword && <p className="field-error">{errors.newPassword.message}</p>}
      </div>

      <div>
        <label className="label" htmlFor="confirmNewPassword">
          Confirm new password
        </label>
        <input
          id="confirmNewPassword"
          type="password"
          className="input"
          {...register("confirmNewPassword", {
            validate: (value) => value === newPassword || "Passwords don't match",
          })}
        />
        {errors.confirmNewPassword && (
          <p className="field-error">{errors.confirmNewPassword.message}</p>
        )}
      </div>

      <button type="submit" disabled={loading} className="btn-secondary">
        {loading ? "Updating…" : "Update password"}
      </button>
    </form>
  );
};

const Profile = () => (
  <div className="mx-auto max-w-2xl space-y-6">
    <h1 className="font-display text-xl font-semibold text-ink dark:text-ink-dark">
      Your profile
    </h1>
    <ProfileForm />
    <PasswordForm />
  </div>
);

export default Profile;
