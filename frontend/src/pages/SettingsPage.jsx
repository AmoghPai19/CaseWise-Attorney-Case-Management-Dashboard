import React, { useState } from "react";
import { useAuth } from "../state/AuthContext";
import api from "../utils/api";

function SettingsPage() {
  const { user, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await api.put("/users/profile", { name });

      updateUser({
        ...user,
        ...res.data,
      });

      setSuccess("Profile updated successfully.");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="font-heading text-3xl text-textPrimary">
          Settings
        </h1>
        <div className="mt-3 h-px w-16 bg-accent opacity-70"></div>
        <p className="mt-4 text-sm text-textSecondary">
          Manage your account details and preferences.
        </p>
      </div>

      {/* PROFILE CARD */}
      <div className="rounded-2xl border border-border bg-surface p-8 shadow-soft">

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-textPrimary">
            Profile Information
          </h2>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-lg border border-border px-4 py-2 text-xs text-textPrimary hover:border-accent transition"
            >
              Edit Profile
            </button>
          )}
        </div>

        {!isEditing ? (
          /* ---------------- VIEW MODE ---------------- */
          <div className="mt-8 space-y-6">

            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-xs uppercase tracking-wider text-textSecondary">
                Name
              </span>
              <span className="text-textPrimary">{user?.name}</span>
            </div>

            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-xs uppercase tracking-wider text-textSecondary">
                Email
              </span>
              <span className="text-textPrimary">{user?.email}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-xs uppercase tracking-wider text-textSecondary">
                Role
              </span>
              <span className="text-textPrimary">{user?.role}</span>
            </div>

          </div>
        ) : (
          /* ---------------- EDIT MODE ---------------- */
          <div className="mt-8 space-y-6">

            <div>
              <label className="block text-xs uppercase tracking-wider text-textSecondary mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-textPrimary focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {/* Status Messages */}
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            {success && (
              <p className="text-sm text-green-400">{success}</p>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleProfileUpdate}
                disabled={loading}
                className="rounded-lg bg-accent px-6 py-2 text-sm font-medium text-black hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>

              <button
                onClick={() => {
                  setIsEditing(false);
                  setName(user?.name || "");
                  setError("");
                }}
                className="rounded-lg border border-border px-6 py-2 text-sm text-textPrimary hover:border-accent transition"
              >
                Cancel
              </button>
            </div>

          </div>
        )}

      </div>

      {/* SECURITY SECTION */}
      <div className="rounded-2xl border border-border bg-surface p-8 shadow-soft">
        <h2 className="text-sm font-semibold tracking-wide text-textPrimary">
          Security
        </h2>

        <p className="mt-4 text-sm text-textSecondary">
          Update your account password.
        </p>

        <PasswordSection />
      </div>

    </div>
  );
}
function PasswordSection() {
  const [showForm, setShowForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChangePassword = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      await api.put("/users/change-password", {
        currentPassword,
        newPassword,
      });

      setMessage("Password updated successfully.");
      setShowForm(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg border border-border px-6 py-2 text-sm text-textPrimary hover:border-accent transition"
        >
          Change Password
        </button>
      ) : (
        <div className="space-y-4">

          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-textPrimary focus:outline-none focus:ring-1 focus:ring-accent"
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-textPrimary focus:outline-none focus:ring-1 focus:ring-accent"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}
          {message && <p className="text-sm text-green-400">{message}</p>}

          <div className="flex gap-4">
            <button
              onClick={handleChangePassword}
              disabled={loading}
              className="rounded-lg bg-accent px-6 py-2 text-sm font-medium text-black hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>

            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-border px-6 py-2 text-sm text-textPrimary hover:border-accent transition"
            >
              Cancel
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

export default SettingsPage;