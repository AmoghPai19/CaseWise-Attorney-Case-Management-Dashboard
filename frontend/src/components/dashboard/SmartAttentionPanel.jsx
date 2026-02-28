import React from "react";
import StatusBadge from "../common/StatusBadge";

function SmartAttentionPanel({ data, loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
        <div className="text-sm font-semibold tracking-wide text-textPrimary">
          Smart Attention Panel
        </div>
        <div className="mt-4 text-sm text-textSecondary">Loading insights...</div>
      </div>
    );
  }

  if (!data) return null;

  const {
    casesClosingSoon = [],
    overdueTasks = [],
    casesMissingDocuments = [],
  } = data;

  return (
    <div className="rounded-2xl border border-border bg-surface p-8 shadow-soft space-y-10">

      {/* Header */}
      <div>
        <h2 className="text-sm font-semibold tracking-wide text-textPrimary">
          Smart Attention Panel
        </h2>
        <p className="mt-2 text-sm text-textSecondary">
          High-risk items requiring immediate attention.
        </p>
      </div>

      {/* Section 1 */}
      <div>
        <div className="mb-4 text-xs uppercase tracking-wider text-textSecondary">
          Cases with deadlines &lt; 3 days
        </div>

        {casesClosingSoon.length === 0 ? (
          <div className="text-sm text-textSecondary">
            No urgent deadlines.
          </div>
        ) : (
          <ul className="space-y-3">
            {casesClosingSoon.map((c) => (
              <li
                key={c._id}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-5 py-4 transition hover:border-accent"
              >
                <div>
                  <div className="text-sm font-semibold text-textPrimary">
                    {c.title}
                  </div>
                  <div className="mt-1 text-xs text-textSecondary">
                    Client: {c.clientId?.name || "N/A"} • Deadline:{" "}
                    {c.deadline
                      ? new Date(c.deadline).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>

                <StatusBadge status={c.status} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Section 2 */}
      <div>
        <div className="mb-4 text-xs uppercase tracking-wider text-textSecondary">
          Overdue Tasks
        </div>

        {overdueTasks.length === 0 ? (
          <div className="text-sm text-textSecondary">
            No overdue tasks. Excellent progress.
          </div>
        ) : (
          <ul className="space-y-3">
            {overdueTasks.map((t) => (
              <li
                key={t._id}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-5 py-4 transition hover:border-accent"
              >
                <div>
                  <div className="text-sm font-semibold text-textPrimary">
                    {t.title}
                  </div>
                  <div className="mt-1 text-xs text-textSecondary">
                    Case: {t.caseId?.title || "N/A"} • Assigned to:{" "}
                    {t.assignedTo?.name || "N/A"}
                  </div>
                </div>

                <StatusBadge status={t.status} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Section 3 */}
      <div>
        <div className="mb-4 text-xs uppercase tracking-wider text-textSecondary">
          Cases Missing Documents
        </div>

        {casesMissingDocuments.length === 0 ? (
          <div className="text-sm text-textSecondary">
            All active cases have required documentation.
          </div>
        ) : (
          <ul className="space-y-3">
            {casesMissingDocuments.map((c) => (
              <li
                key={c._id}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-5 py-4 transition hover:border-accent"
              >
                <div>
                  <div className="text-sm font-semibold text-textPrimary">
                    {c.title}
                  </div>
                  <div className="mt-1 text-xs text-textSecondary">
                    Deadline:{" "}
                    {c.deadline
                      ? new Date(c.deadline).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>

                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                  Missing Docs
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default SmartAttentionPanel;