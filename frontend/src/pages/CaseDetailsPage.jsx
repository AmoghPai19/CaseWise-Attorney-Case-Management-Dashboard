import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import StatusBadge from "../components/common/StatusBadge";
import { useAuth } from "../state/AuthContext";

function CaseDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // 🔥 NEW STATES
  const [taskModal, setTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskSaving, setTaskSaving] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "",
    status: "",
    deadline: "",
  });

  const canManage =
    user?.role === "Admin" || user?.role === "Attorney";

  const fetchCase = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/cases/${id}`);
      setData(res.data);

      const c = res.data.case;

      setForm({
        title: c.title,
        description: c.description || "",
        priority: c.priority,
        status: c.status,
        deadline: c.deadline
          ? new Date(c.deadline).toISOString().split("T")[0]
          : "",
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load case");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);

      await api.put(`/cases/${id}`, {
        ...form,
        clientId: data.case.clientId?._id,
        assignedAttorney: data.case.assignedAttorney?._id,
      });

      await fetchCase();
      setEditMode(false);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update case");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this case permanently?")) return;
    try {
      await api.delete(`/cases/${id}`);
      navigate("/cases");
    } catch (err) {
      console.error(err);
      setError("Failed to delete case");
    }
  };

  // 🔥 CREATE TASK
  const handleCreateTask = async () => {
    try {
      setTaskSaving(true);

      await api.post("/tasks", {
        caseId: id,
        title: taskTitle,
        dueDate: taskDueDate,
        assignedTo: data.case.assignedAttorney._id,
      });

      setTaskTitle("");
      setTaskDueDate("");
      setTaskModal(false);
      await fetchCase();
    } catch (err) {
      console.error(err);
      setError("Failed to create task");
    } finally {
      setTaskSaving(false);
    }
  };

  // 🔥 UPLOAD DOCUMENT
  const handleUpload = async (file) => {
    if (!file) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("caseId", id);

      await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchCase();
    } catch (err) {
      console.error(err);
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading)
    return <div className="text-textSecondary">Loading...</div>;

  if (error)
    return <div className="text-danger">{error}</div>;

  if (!data) return null;

  const { case: caseDoc, tasks = [], documents = [] } = data;

  return (
    <div className="space-y-10">

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/cases")}
        className="text-sm text-textSecondary hover:text-accent transition"
      >
        ← Back to Cases
      </button>

      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          {editMode ? (
            <input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              className="text-4xl font-heading bg-transparent border-b border-border text-textPrimary outline-none"
            />
          ) : (
            <h1 className="font-heading text-4xl text-textPrimary">
              {caseDoc.title}
            </h1>
          )}

          <p className="mt-3 text-sm text-textSecondary">
            Client: {caseDoc.clientId?.name || "N/A"} • Attorney:{" "}
            {caseDoc.assignedAttorney?.name || "N/A"}
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <StatusBadge status={caseDoc.status} />
          <StatusBadge status={caseDoc.priority} />

          {canManage && !editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black"
            >
              Edit Case
            </button>
          )}

          {canManage && editMode && (
            <>
              <button
                onClick={() => setEditMode(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm text-textSecondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          )}

          {canManage && (
            <button
              onClick={handleDelete}
              className="rounded-lg border border-danger px-4 py-2 text-sm text-danger"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* SUMMARY CARD (UNCHANGED) */}
      <div className="rounded-2xl border border-border bg-surface p-8 shadow-soft">
        <h2 className="mb-6 text-sm font-semibold tracking-wide text-textPrimary">
          Executive Summary
        </h2>

        {(() => {
          const createdAt = caseDoc.createdAt
            ? new Date(caseDoc.createdAt)
            : null;

          const deadline = caseDoc.deadline
            ? new Date(caseDoc.deadline)
            : null;

          const now = new Date();

          const caseAge = createdAt
            ? Math.floor((now - createdAt) / (1000 * 60 * 60 * 24))
            : null;

          const daysRemaining = deadline
            ? Math.floor((deadline - now) / (1000 * 60 * 60 * 24))
            : null;

          const completedTasks = tasks.filter(t => t.status === "Completed").length;
          const openTasks = tasks.length - completedTasks;

          const isOverdue = deadline && deadline < now;
          const isHighRisk =
            caseDoc.priority === "High" && daysRemaining !== null && daysRemaining <= 7;

          return (
            <div className="grid gap-y-8 md:grid-cols-3 md:gap-x-16">
              <SummaryItem label="Case Age" value={caseAge !== null ? `${caseAge} days active` : "N/A"} />
              <SummaryItem label="Timeline" value={deadline ? (isOverdue ? "Overdue" : `${daysRemaining} days remaining`) : "No deadline"} />
              <SummaryItem label="Task Progress" value={`${completedTasks}/${tasks.length} completed`} />
              <SummaryItem label="Open Tasks" value={openTasks} />
              <SummaryItem label="Documents" value={documents.length === 0 ? "No uploads" : `${documents.length} uploaded`} />
              <SummaryItem label="Risk Indicator" value={isOverdue ? "High (Overdue)" : isHighRisk ? "Elevated" : "Stable"} />
            </div>
          );
        })()}
      </div>

      {/* MAIN GRID */}
      <div className="grid gap-8 md:grid-cols-3">

        {/* CASE INFO */}
        <div className="md:col-span-2 rounded-2xl border border-border bg-surface p-8 shadow-soft">
          <h2 className="mb-8 text-sm font-semibold tracking-wide text-textPrimary">
            Case Information
          </h2>

          <div className="grid gap-8 md:grid-cols-2">

            <InfoBlock
              label="Status"
              value={
                editMode ? (
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value }))
                    }
                    className="mt-2 w-full rounded-lg bg-surface border border-border text-textPrimary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent transition"
                  >
                    <option>Open</option>
                    <option>Pending</option>
                    <option>Closed</option>
                  </select>
                ) : (
                  caseDoc.status
                )
              }
            />

            <InfoBlock
              label="Priority"
              value={
                editMode ? (
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, priority: e.target.value }))
                    }
                    className="mt-2 w-full rounded-lg bg-surface border border-border text-textPrimary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent transition"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                ) : (
                  caseDoc.priority
                )
              }
            />

            <InfoBlock
              label="Deadline"
              value={
                editMode ? (
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, deadline: e.target.value }))
                    }
                    className="mt-2 w-full rounded-lg bg-surface border border-border text-textPrimary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent transition"
                  />
                ) : caseDoc.deadline ? (
                  new Date(caseDoc.deadline).toLocaleDateString()
                ) : (
                  "N/A"
                )
              }
            />

            <div className="md:col-span-2">
              <div className="text-[11px] uppercase tracking-wider text-textSecondary">
                Description
              </div>

              {editMode ? (
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={4}
                  className="mt-3 w-full rounded-lg bg-surface border border-border text-textPrimary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent transition"
                />
              ) : (
                <div className="mt-3 text-base font-medium text-textPrimary whitespace-pre-wrap">
                  {caseDoc.description || "No description provided."}
                </div>
              )}
            </div>

          </div>

          {/* SMART TASK PANEL */}
          <div className="mt-10 border-t border-border pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-textPrimary">
                Tasks ({tasks.length})
              </h3>
              <button
                onClick={() => setShowTasks(!showTasks)}
                className="text-xs text-accent"
              >
                {showTasks ? "Hide" : "View"}
              </button>
            </div>

            {showTasks && (
              <div className="mt-6 space-y-4">
                {tasks.length === 0 ? (
                  <div className="text-textSecondary text-sm">
                    No tasks created.
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task._id}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div>
                        <div className="text-sm font-medium text-textPrimary">
                          {task.title}
                        </div>
                        <div className="text-xs text-textSecondary mt-1">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
            <h3 className="mb-4 text-sm font-semibold text-textPrimary">
              Documents
            </h3>

            {documents.length === 0 ? (
              <div className="text-textSecondary">
                No documents uploaded.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-textSecondary text-sm">
                  {documents.length} document(s)
                </div>

                <div className="space-y-2">
                  {documents.map((doc) => (
                    <a
                      key={doc._id}
                      href={`${import.meta.env.VITE_API_URL}${doc.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg border border-border px-3 py-2 text-sm text-textPrimary hover:border-accent transition"
                    >
                      {doc.filename}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
            <h3 className="mb-4 text-sm font-semibold text-textPrimary">
              Quick Actions
            </h3>

            <button
              onClick={() => setTaskModal(true)}
              className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black"
            >
              Add Task
            </button>

            <label className="mt-3 w-full cursor-pointer rounded-lg border border-border px-4 py-2 text-sm text-textPrimary text-center block">
              {uploading ? "Uploading..." : "Upload Document"}
              <input
                type="file"
                hidden
                onChange={(e) => handleUpload(e.target.files[0])}
              />
            </label>
          </div>
        </div>
      </div>

      {/* TASK MODAL */}
      {taskModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">

          {/* MODAL CARD */}
          <div className="bg-surface w-full max-w-md rounded-2xl border border-border shadow-2xl p-8">

            <h3 className="text-lg font-semibold text-textPrimary mb-8">
              Create Task
            </h3>

            {/* Task Title */}
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-wider text-textSecondary mb-2">
                Task Title
              </label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Enter task title"
                className="rounded-lg border border-border bg-surface px-4 py-2 text-textPrimary"              />
            </div>

            {/* Due Date */}
            <div className="mb-8">
              <label className="block text-xs uppercase tracking-wider text-textSecondary mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="rounded-lg border border-border bg-surface px-4 py-2 text-textPrimary 
                          appearance-none 
                          [&::-webkit-calendar-picker-indicator]:invert 
                          [&::-webkit-calendar-picker-indicator]:opacity-80 
                          [&::-webkit-calendar-picker-indicator]:cursor-pointer" />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setTaskModal(false)}
                className="px-4 py-2 border border-border rounded-lg text-textSecondary hover:border-accent transition"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateTask}
                disabled={taskSaving}
                className="px-5 py-2 bg-accent rounded-lg font-medium text-black disabled:opacity-60"
              >
                {taskSaving ? "Creating..." : "Create"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

const SummaryItem = ({ label, value }) => (
  <div>
    <div className="text-[11px] uppercase tracking-wider text-textSecondary">
      {label}
    </div>
    <div className="mt-2 text-xl font-semibold text-textPrimary">
      {value}
    </div>
  </div>
);

const InfoBlock = ({ label, value }) => (
  <div>
    <div className="text-[11px] uppercase tracking-wider text-textSecondary">
      {label}
    </div>
    <div className="mt-2 text-xl font-semibold text-textPrimary">
      {value}
    </div>
  </div>
);

export default CaseDetailsPage;