import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import StatusBadge from "../components/common/StatusBadge";
import Pagination from "../components/common/Pagination";
import { useAuth } from "../state/AuthContext";

const PAGE_SIZE = 10;

function CasesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);

  async function fetchCases() {
    try {
      setLoading(true);
      const res = await api.get("/cases");
      setCases(res.data || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load cases");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCases();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this case?")) return;

    try {
      await api.delete(`/cases/${id}`);
      setCases(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete case");
    }
  }

  const filteredSorted = useMemo(() => {
    let data = [...cases];

    if (search)
      data = data.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase())
      );

    if (statusFilter)
      data = data.filter(c => c.status === statusFilter);

    if (priorityFilter)
      data = data.filter(c => c.priority === priorityFilter);

    data.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;

      if (sortKey === "deadline" || sortKey === "createdAt") {
        return (new Date(a[sortKey]) - new Date(b[sortKey])) * dir;
      }

      return (a[sortKey] || "")
        .toString()
        .localeCompare((b[sortKey] || "").toString()) * dir;
    });

    return data;
  }, [cases, search, statusFilter, priorityFilter, sortKey, sortDir]);

  const pageData = filteredSorted.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const canCreateCases =
    user && ["Admin", "Attorney"].includes(user.role);

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl text-textPrimary">
            Cases
          </h1>
          <div className="mt-3 h-px w-14 bg-accent opacity-70"></div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchCases}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-textSecondary transition hover:bg-surfaceHover hover:text-textPrimary"
          >
            Refresh
          </button>

          {canCreateCases && (
            <Link
              to="/cases/new"
              className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-black transition hover:opacity-90"
            >
              + New Case
            </Link>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-danger bg-surface p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-soft">
        <table className="w-full text-sm">

          {/* Header */}
          <thead className="bg-surfaceHover text-textSecondary text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 text-left">Title</th>
              <th className="px-6 py-4 text-left">Client</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Priority</th>
              <th className="px-6 py-4 text-left">Deadline</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-14 text-center text-textSecondary">
                  Loading cases...
                </td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-16 text-center text-textSecondary">
                  No cases found.
                </td>
              </tr>
            ) : (
              pageData.map((c) => (
                <tr
                  key={c._id}
                  onClick={() => navigate(`/cases/${c._id}`)}
                  className="group cursor-pointer transition-all duration-150 hover:bg-surfaceHover"
                >
                  {/* Title */}
                  <td className="px-6 py-5 align-middle font-medium text-textPrimary">
                    {c.title}
                  </td>

                  {/* Client */}
                  <td className="px-6 py-5 align-middle text-textSecondary">
                    {c.clientId?.name || "—"}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-5 align-middle">
                    <StatusBadge status={c.status} />
                  </td>

                  {/* Priority */}
                  <td className="px-6 py-5 align-middle">
                    <StatusBadge status={c.priority} />
                  </td>

                  {/* Deadline */}
                  <td className="px-6 py-5 align-middle text-textSecondary">
                    {new Date(c.deadline).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5 align-middle text-right">
                    <div className="flex justify-end items-center gap-6">

                      {/* Edit */}
                      <Link
                        to={`/cases/${c._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm font-medium text-textSecondary transition hover:text-accent"
                      >
                        Edit
                      </Link>

                      {/* Delete Case */}
                      {(user?.role === "Admin" ||
                        user?.role === "Attorney") && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(c._id);
                          }}
                          className="text-sm font-medium text-danger transition hover:text-red-400"
                        >
                          Delete Case
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={filteredSorted.length}
        onPageChange={setPage}
      />
    </div>
  );
}

export default CasesPage;