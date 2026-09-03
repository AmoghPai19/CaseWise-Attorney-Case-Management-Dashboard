import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  AreaChart,
  Area,
  Legend,
  LabelList,
} from "recharts";
import api from "../utils/api";
import StatsCard from "../components/common/StatsCard";
import SmartAttentionPanel from "../components/dashboard/SmartAttentionPanel";
import { useAuth } from "../state/AuthContext";

const PRIORITY_COLORS = {
  High: "#101113",
  Medium: "#6B7280",
  Low: "#D1D5DB",
};

const STATUS_COLORS = {
  Open: "#101113",
  Pending: "#9CA3AF",
  Closed: "#E5E7EB",
};

const RISK_COLORS = ["#101113", "#9CA3AF", "#E5E7EB"];

/* -----------------------------
   TOOLTIP – PRIORITY
------------------------------ */
const CustomPriorityTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const priority = payload[0].payload.priority;
    const count = payload[0].value;
    const color = PRIORITY_COLORS[priority] || "#6B7280";

    return (
      <div
        style={{
          background: "#FFFFFF",
          border: `1px solid #E5E7EB`,
          borderRadius: "12px",
          padding: "12px 16px",
          boxShadow: "0 4px 16px rgba(16,17,19,0.08)",
          fontSize: "13px",
        }}
      >
        <div style={{ color, fontWeight: 600, marginBottom: 4 }}>
          {priority} Priority
        </div>
        <div style={{ color: "#6B7280" }}>
          Total Cases: <strong style={{ color: "#101113" }}>{count}</strong>
        </div>
      </div>
    );
  }
  return null;
};

/* -----------------------------
   TOOLTIP – PIE CHARTS
------------------------------ */
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const name = payload[0].name;
    const value = payload[0].value;

    return (
      <div
        style={{
          background: "#FFFFFF",
          border: `1px solid #E5E7EB`,
          borderRadius: "12px",
          padding: "12px 16px",
          boxShadow: "0 4px 16px rgba(16,17,19,0.08)",
          fontSize: "13px",
          minWidth: "140px",
        }}
      >
        <div style={{ color: "#101113", fontWeight: 600, marginBottom: 4 }}>
          {name}
        </div>
        <div style={{ color: "#6B7280" }}>
          Value: <strong style={{ color: "#101113" }}>{value}</strong>
        </div>
      </div>
    );
  }
  return null;
};

function DashboardPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState({});
  const [attention, setAttention] = useState(null);
  const [auditFrom, setAuditFrom] = useState("");
  const [auditTo, setAuditTo] = useState("");

  useEffect(() => {
    async function fetchData() {
      const res = await api.get("/dashboard/overview");
      setOverview(res.data || {});
      const att = await api.get("/dashboard/attention");
      setAttention(att.data);
    }
    fetchData();
  }, []);

  const safeArray = (arr) => (Array.isArray(arr) ? arr : []);

  const handleAuditDownload = async (format) => {
    try {
      let url = `/audit/export?format=${format}`;

      if (auditFrom) url += `&from=${auditFrom}`;
      if (auditTo) url += `&to=${auditTo}`;

      const response = await api.get(url, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: format === "csv" ? "text/csv" : "application/json",
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `audit_logs.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <div className="space-y-14">

      {/* METRICS */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

        <StatsCard
          label="Total Active Cases"
          value={overview.totalActiveCases ?? 0}
          valueClassName="text-textPrimary"
        />

        <StatsCard
          label="Cases Closing Soon"
          value={overview.casesClosingSoon ?? 0}
          valueClassName="text-warning"
        />

        <StatsCard
          label="Overdue Tasks"
          value={overview.overdueTasks ?? 0}
          valueClassName="text-danger"
        />

        <StatsCard
          label="Total Revenue"
          value={`$${(overview.totalRevenue ?? 0).toLocaleString()}`}
          valueClassName="text-success"
          sublabel={user?.role === "Admin" ? "Firm-wide" : "Your cases"}
        />

      </div>

      {/* REVENUE BY ATTORNEY (Admin only) */}
      {user?.role === "Admin" && safeArray(overview.revenueByAttorney).length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-8 shadow-soft">
          <h2 className="mb-6 text-sm font-semibold text-textPrimary">
            Revenue by Attorney
          </h2>

          <div className="divide-y divide-border">
            {overview.revenueByAttorney.map((row) => (
              <div
                key={row.attorneyId}
                className="flex items-center justify-between py-4"
              >
                <div>
                  <p className="text-sm font-medium text-textPrimary">
                    {row.attorneyName}
                  </p>
                  <p className="text-xs text-textSecondary mt-1">
                    {row.caseCount} case{row.caseCount === 1 ? "" : "s"}
                  </p>
                </div>
                <p className="text-lg font-semibold text-success">
                  ${row.revenue.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRIORITY + STATUS */}
      <div className="grid gap-8 lg:grid-cols-3">

        {/* PRIORITY */}
        <div className="rounded-xl border border-border bg-surface p-8 shadow-soft lg:col-span-2">
          <h2 className="mb-6 text-sm font-semibold text-textPrimary">
            Cases by Priority
          </h2>

          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={safeArray(overview.casesByPriority)} barCategoryGap="20%">
                <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                <XAxis dataKey="priority" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />

                <Tooltip
                  content={<CustomPriorityTooltip />}
                  cursor={{ fill: "rgba(16,17,19,0.04)" }}
                />

                <Bar
                  dataKey="count"
                  radius={[8, 8, 0, 0]}
                  barSize={60}
                  animationDuration={400}
                >
                  <LabelList dataKey="count" position="top" fill="#6B7280" />
                  {safeArray(overview.casesByPriority).map((entry, index) => (
                    <Cell
                      key={index}
                      fill={PRIORITY_COLORS[entry.priority] || "#9CA3AF"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* STATUS PIE */}
        <div className="rounded-xl border border-border bg-surface p-8 shadow-soft">
          <h2 className="mb-6 text-sm font-semibold text-textPrimary">
            Case Status Distribution
          </h2>

          <div className="h-80">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  dataKey="count"
                  data={safeArray(overview.caseStatusDistribution)}
                  nameKey="status"
                  outerRadius={95}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {safeArray(overview.caseStatusDistribution).map((entry, index) => (
                    <Cell
                      key={index}
                      fill={STATUS_COLORS[entry.status] || "#9CA3AF"}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* MONTHLY TREND - Rolling 5 Months */}
      <div className="rounded-xl border border-border bg-surface p-8 shadow-soft">
        <h2 className="mb-6 text-sm font-semibold text-textPrimary">
          Monthly Case Intake Trend (Last 5 Months)
        </h2>

        <div className="h-80">
          <ResponsiveContainer>
            {(() => {
              const now = new Date();

              // Convert backend data into proper Date objects
              const parsedData = safeArray(overview.monthlyTrend)
                .map((item) => {
                  if (!item.date) return null;

                  const [year, month] = item.date.split("-");
                  const dateObj = new Date(Number(year), Number(month) - 1);

                  return {
                    ...item,
                    dateObj,
                  };
                })
                .filter(Boolean)
                .filter((item) => item.dateObj <= now);

              // Sort ascending
              parsedData.sort((a, b) => a.dateObj - b.dateObj);

              // Take last 5 months only
              const lastFiveMonths = parsedData.slice(-5);

              return (
                <AreaChart data={lastFiveMonths}>
                  <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />

                  <XAxis
                    dataKey="date"
                    stroke="#6B7280"
                    tickFormatter={(value) => {
                      const [year, month] = value.split("-");
                      const dateObj = new Date(Number(year), Number(month) - 1);

                      return dateObj.toLocaleString("default", {
                        month: "short",
                        year: "numeric",
                      });
                    }}
                  />

                  <YAxis stroke="#6B7280" />

                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;

                      const { date, count } = payload[0].payload;
                      const [year, month] = date.split("-");
                      const dateObj = new Date(Number(year), Number(month) - 1);

                      const formattedDate = dateObj.toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      });

                      return (
                        <div className="rounded-lg border border-border bg-surface px-4 py-3 shadow-lg">
                          <p className="text-sm font-semibold text-textPrimary">
                            {formattedDate}
                          </p>
                          <p className="text-sm text-textSecondary mt-1">
                            Cases: <span className="font-semibold">{count}</span>
                          </p>
                        </div>
                      );
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#101113"
                    strokeWidth={2}
                    fillOpacity={0.2}
                    fill="#101113"
                  >
                    <LabelList
                      dataKey="count"
                      position="top"
                      fill="#6B7280"
                    />
                  </Area>
                </AreaChart>
              );
            })()}
          </ResponsiveContainer>
        </div>
      </div>

      {/* TASK + RISK ROW */}
      <div className="grid gap-8 lg:grid-cols-2">

        {/* URGENCY PANEL */}
        <div className="rounded-xl border border-border bg-surface p-8 shadow-soft">
          <h2 className="mb-6 text-sm font-semibold text-textPrimary">
            Immediate Attention Required
          </h2>

          <div className="space-y-6">

            {/* Closing Soon */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-textSecondary">
                  Cases Closing Within 3 Days
                </p>
                <p className="text-3xl font-semibold text-warning">
                  {overview.casesClosingSoon ?? 0}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-textSecondary">
                  Time-sensitive
                </span>
              </div>
            </div>

            {/* Overdue Tasks */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-textSecondary">
                  Overdue Tasks
                </p>
                <p className="text-3xl font-semibold text-danger">
                  {overview.overdueTasks ?? 0}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-textSecondary">
                  Requires escalation
                </span>
              </div>
            </div>

            {/* Health Badge */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs uppercase tracking-wider text-textSecondary mb-2">
                System Health
              </p>

              <div
                className={`inline-block px-4 py-2 rounded-full text-xs font-medium ${
                  overview.overdueTasks > 10
                    ? "bg-red-50 text-danger"
                    : overview.overdueTasks > 5
                    ? "bg-amber-50 text-warning"
                    : "bg-emerald-50 text-success"
                }`}
              >
                {overview.overdueTasks > 10
                  ? "High Risk"
                  : overview.overdueTasks > 5
                  ? "Elevated Risk"
                  : "Stable"}
              </div>
            </div>

          </div>
        </div>

        {/* RISK */}
        <div className="rounded-xl border border-border bg-surface p-8 shadow-soft">
          <h2 className="mb-6 text-sm font-semibold text-textPrimary">
            Operational Risk Distribution
          </h2>

          <div className="h-80">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  dataKey="value"
                  data={safeArray(overview.riskDistribution)}
                  nameKey="level"
                  outerRadius={95}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {safeArray(overview.riskDistribution).map((entry, index) => (
                    <Cell key={index} fill={RISK_COLORS[index % 3]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <SmartAttentionPanel data={attention} />
      {/* AUDIT SECTION */}
      {(user?.role === "Admin" || user?.role === "Attorney") && (
        <div className="rounded-xl border border-border bg-surface p-8 shadow-soft">
          <h2 className="mb-6 text-sm font-semibold text-textPrimary">
            Audit & Compliance
          </h2>

          <div className="grid md:grid-cols-3 gap-6 items-end">

            <div>
              <label className="block text-xs uppercase text-textSecondary mb-2">
                From
              </label>
              <input
                type="date"
                value={auditFrom}
                onChange={(e) => setAuditFrom(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-textPrimary"
              />
            </div>

            <div>
              <label className="block text-xs uppercase text-textSecondary mb-2">
                To
              </label>
              <input
                type="date"
                value={auditTo}
                onChange={(e) => setAuditTo(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-textPrimary"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleAuditDownload("csv")}
                className="rounded-lg bg-accent px-6 py-2 text-sm font-medium text-white"
              >
                Download CSV
              </button>

              <button
                onClick={() => handleAuditDownload("json")}
                className="rounded-lg border border-border px-6 py-2 text-sm text-textPrimary"
              >
                Download JSON
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;