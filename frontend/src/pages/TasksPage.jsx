import React, { useEffect, useState } from "react";
import api from "../utils/api";
import StatusBadge from "../components/common/StatusBadge";

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchTasks() {
      try {
        setLoading(true);
        const res = await api.get("/tasks", {
          params: { status: statusFilter || undefined },
        });
        if (isMounted) setTasks(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load tasks");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchTasks();
    return () => {
      isMounted = false;
    };
  }, [statusFilter]);

  // 🔥 Update Status
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, {
        status: newStatus,
      });

      setTasks((prev) =>
        prev.map((t) =>
          t._id === taskId ? { ...t, status: newStatus } : t
        )
      );
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to update status");
    }
  };

  // 🔥 Delete Task
  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task permanently?")) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };
  // 🔥 Sort tasks by priority order
  const statusOrder = {
    Open: 1,
    "In Progress": 2,
    Overdue: 3,
    Completed: 4,
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
  });

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl text-textPrimary">
          Tasks
        </h1>
        <p className="mt-2 text-sm text-textSecondary">
          Cross-case task management overview.
        </p>
        <div className="mt-3 h-px w-16 bg-accent opacity-70"></div>
      </div>

      {/* Filter */}
      <div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-textPrimary focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">All statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-background text-textSecondary uppercase tracking-wide text-xs">
            <tr>
              <th className="px-6 py-4">Task</th>
              <th className="px-6 py-4">Case</th>
              <th className="px-6 py-4">Assigned To</th>
              <th className="px-6 py-4">Due</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-textSecondary">
                  Loading tasks...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-danger">
                  {error}
                </td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-textSecondary">
                  No tasks found.
                </td>
              </tr>
            ) : (
              sortedTasks.map((t) => ( 
                <tr key={t._id} className="hover:bg-background transition">
                  <td className="px-6 py-4 text-textPrimary font-medium">
                    {t.title}
                  </td>

                  <td className="px-6 py-4 text-textSecondary">
                    {t.caseId?.title || "N/A"}
                  </td>

                  <td className="px-6 py-4 text-textSecondary">
                    {t.assignedTo?.name || "N/A"}
                  </td>

                  <td className="px-6 py-4 text-textSecondary">
                    {t.dueDate
                      ? new Date(t.dueDate).toLocaleDateString()
                      : "N/A"}
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={t.status} />
                  </td>

                  {/* 🔥 ACTIONS */}
                  <td className="px-6 py-4 text-right space-x-3">

                    {/* Change Status */}
                    <select
                      value={t.status}
                      onChange={(e) =>
                        handleStatusChange(t._id, e.target.value)
                      }
                      className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-textPrimary focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Overdue">Overdue</option>
                    </select>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="rounded-md border border-danger px-3 py-1 text-xs text-danger hover:bg-danger/10 transition"
                    >
                      Delete
                    </button>

                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default TasksPage;