import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

function CreateCasePage() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    clientId: "",
    priority: "Medium",
    deadline: "",
    tags: ""
  });

  useEffect(() => {
    async function loadClients() {
      try {
        const res = await api.get("/clients");
        setClients(res.data || []);
      } catch {
        setError("Failed to load clients");
      }
    }
    loadClients();
  }, []);

  function handleChange(e) {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.title || !form.clientId || !form.deadline)
      return setError("Please fill all required fields");

    try {
      setLoading(true);

      const res = await api.post("/cases", {
        ...form,
        tags: form.tags ? form.tags.split(",").map(t => t.trim()) : []
      });

      navigate(`/cases/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10">

      {/* Back Button */}
      <button
        onClick={() => navigate("/cases")}
        className="text-sm text-textSecondary hover:text-accent transition"
      >
        ← Back to Cases
      </button>

      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl text-textPrimary">
          Create Case
        </h1>
        <div className="mt-3 h-px w-16 bg-accent opacity-70"></div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-danger bg-surface p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Form Container */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-border bg-surface p-10 shadow-soft space-y-8"
      >

        {/* Title */}
        <div>
          <label className="block text-sm text-textSecondary mb-2">
            Title *
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-textPrimary focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-textSecondary mb-2">
            Description
          </label>
          <textarea
            name="description"
            rows="4"
            value={form.description}
            onChange={handleChange}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-textPrimary focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Two Column Section */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* Client */}
          <div>
            <label className="block text-sm text-textSecondary mb-2">
              Client *
            </label>
            <select
              name="clientId"
              value={form.clientId}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-textPrimary focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">Select Client</option>
              {clients.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm text-textSecondary mb-2">
              Priority
            </label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-textPrimary focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm text-textSecondary mb-2">
              Deadline *
            </label>
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-textPrimary focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm text-textSecondary mb-2">
              Tags
            </label>
            <input
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="Comma separated"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-textPrimary focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            disabled={loading}
            className="rounded-lg bg-accent px-8 py-3 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Case"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateCasePage;