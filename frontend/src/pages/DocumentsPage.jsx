import React, { useEffect, useState } from "react";
import api from "../utils/api";
import StatusBadge from "../components/common/StatusBadge";
import { useAuth } from "../state/AuthContext";

function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const canManage =
    user?.role === "Admin" || user?.role === "Attorney";

  useEffect(() => {
    let isMounted = true;

    async function fetchDocs() {
      try {
        setLoading(true);
        const res = await api.get("/documents");
        if (isMounted) setDocuments(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load documents");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDocs();
    return () => {
      isMounted = false;
    };
  }, []);

  // 🔥 DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document permanently?")) return;

    try {
      await api.delete(`/documents/${id}`);
      setDocuments((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete document");
    }
  };

  // 🔥 UPDATE STATUS
  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/documents/${id}`, { status: newStatus });

      setDocuments((prev) =>
        prev.map((d) =>
          d._id === id ? { ...d, status: newStatus } : d
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl text-textPrimary">
          Documents
        </h1>
        <p className="mt-2 text-sm text-textSecondary">
          Centralized view of all uploaded documents across cases.
        </p>
        <div className="mt-3 h-px w-16 bg-accent opacity-70"></div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
        <table className="min-w-full text-left text-sm">

          <thead className="bg-background text-textSecondary uppercase tracking-wide text-xs">
            <tr>
              <th className="px-6 py-4">Filename</th>
              <th className="px-6 py-4">Case</th>
              <th className="px-6 py-4">Uploaded By</th>
              <th className="px-6 py-4">Uploaded At</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-textSecondary">
                  Loading documents...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-danger">
                  {error}
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-textSecondary">
                  No documents found.
                </td>
              </tr>
            ) : (
              documents.map((d) => (
                <tr key={d._id} className="hover:bg-background transition">

                  <td className="px-6 py-4 text-textPrimary font-medium">
                    {d.filename}
                  </td>

                  <td className="px-6 py-4 text-textSecondary">
                    {d.caseId?.title || "N/A"}
                  </td>

                  <td className="px-6 py-4 text-textSecondary">
                    {d.uploadedBy?.name || "N/A"}
                  </td>

                  <td className="px-6 py-4 text-textSecondary">
                    {d.uploadedAt
                      ? new Date(d.uploadedAt).toLocaleDateString()
                      : "N/A"}
                  </td>

                  {/* STATUS WITH INLINE CHANGE */}
                  <td className="px-6 py-4">
                    {canManage ? (
                      <select
                        value={d.status}
                        onChange={(e) =>
                          handleStatusChange(d._id, e.target.value)
                        }
                        className="rounded-md border border-border bg-surface px-3 py-1 text-xs text-textPrimary focus:outline-none focus:ring-1 focus:ring-accent"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Reviewed">Reviewed</option>
                      </select>
                    ) : (
                      <StatusBadge status={d.status} />
                    )}
                  </td>

                  {/* ALIGNED ACTIONS */}
                  <td className="px-6 py-4">
                    <div className="flex justify-end items-center gap-3">

                      <a
                        href={`http://localhost:5000${d.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border border-border px-3 py-1 text-xs text-textPrimary hover:border-accent transition"
                      >
                        Download
                      </a>

                      {canManage && (
                        <button
                          onClick={() => handleDelete(d._id)}
                          className="rounded-md border border-danger px-3 py-1 text-xs text-danger hover:bg-danger/10 transition"
                        >
                          Delete
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
    </div>
  );
}

export default DocumentsPage;