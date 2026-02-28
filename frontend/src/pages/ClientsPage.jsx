import React, { useEffect, useState } from "react";
import api from "../utils/api";

function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const loadClients = async () => {
    try {
      setLoading(true);
      const res = await api.get("/clients", {
        params: { search: search || undefined },
      });
      setClients(res.data || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.post("/clients", form);
      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
      });
      await loadClients();
    } catch (err) {
      console.error(err);
      setError("Failed to create client");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10">

      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl text-textPrimary">
          Clients
        </h1>
        <div className="mt-3 h-px w-16 bg-accent opacity-70"></div>
        <p className="mt-4 text-sm text-textSecondary">
          Manage your client roster and contact details.
        </p>
      </div>

      {/* Layout */}
      <div className="grid gap-8 lg:grid-cols-3 items-start">

        {/* Left Section - Table */}
        <div className="lg:col-span-2 space-y-6">

          {/* Search */}
          <div>
            <input
              type="search"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={loadClients}
              className="w-full max-w-sm rounded-lg border border-border bg-background px-4 py-3 text-sm text-textPrimary placeholder:text-textSecondary focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-soft">
            <table className="w-full text-sm">

              <thead className="bg-surfaceHover text-textSecondary text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">Phone</th>
                  <th className="px-6 py-4 text-left">Created by</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">

                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-textSecondary">
                      Loading clients...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-danger">
                      {error}
                    </td>
                  </tr>
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-textSecondary">
                      No clients found.
                    </td>
                  </tr>
                ) : (
                  clients.map((c) => (
                    <tr
                      key={c._id}
                      className="transition-colors hover:bg-surfaceHover"
                    >
                      <td className="px-6 py-4 font-medium text-textPrimary">
                        {c.name}
                      </td>
                      <td className="px-6 py-4 text-textSecondary">
                        {c.email}
                      </td>
                      <td className="px-6 py-4 text-textSecondary">
                        {c.phone}
                      </td>
                      <td className="px-6 py-4 text-textSecondary">
                        {c.createdBy?.name || "N/A"}
                      </td>
                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>
        </div>

        {/* Right Section - Add Client Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-border bg-surface p-8 shadow-soft space-y-6"
        >
          <h2 className="text-sm font-semibold text-textPrimary">
            Add Client
          </h2>

          <div className="space-y-4">

            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
              placeholder="Full name"
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-textPrimary placeholder:text-textSecondary focus:outline-none focus:ring-1 focus:ring-accent"
            />

            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="Email"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-textPrimary placeholder:text-textSecondary focus:outline-none focus:ring-1 focus:ring-accent"
            />

            <input
              type="text"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              placeholder="Phone"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-textPrimary placeholder:text-textSecondary focus:outline-none focus:ring-1 focus:ring-accent"
            />

            <input
              type="text"
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
              placeholder="Address"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-textPrimary placeholder:text-textSecondary focus:outline-none focus:ring-1 focus:ring-accent"
            />

            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="Notes"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-textPrimary placeholder:text-textSecondary focus:outline-none focus:ring-1 focus:ring-accent"
            />

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-accent px-6 py-3 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Add Client"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}

export default ClientsPage;