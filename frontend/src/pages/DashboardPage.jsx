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
  High: "#C14953",
  Medium: "#C5A75D",
  Low: "#2F6F6F",
};

const STATUS_COLORS = {
  Open: "#2F6F6F",
  Pending: "#C5A75D",
  Closed: "#5A6472",
};

const RISK_COLORS = ["#C14953", "#C5A75D", "#2F6F6F"];

/* -----------------------------
   PREMIUM TOOLTIP – PRIORITY
------------------------------ */
const CustomPriorityTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const priority = payload[0].payload.priority;
    const count = payload[0].value;
    const color = PRIORITY_COLORS[priority] || "#5A6472";

    return (
      <div
        style={{
          background: "rgba(18, 24, 33, 0.95)",
          border: `1px solid ${color}`,
          borderRadius: "14px",
          padding: "12px 16px",
          backdropFilter: "blur(10px)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
          fontSize: "13px",
        }}
      >
        <div style={{ color, fontWeight: 600, marginBottom: 4 }}>
          {priority} Priority
        </div>
        <div style={{ color: "#CBD5E1" }}>
          Total Cases: <strong>{count}</strong>
        </div>
      </div>
    );
  }
  return null;
};

/* -----------------------------
   PREMIUM TOOLTIP – PIE CHARTS
------------------------------ */
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const name = payload[0].name;
    const value = payload[0].value;
    const color = payload[0].color;

    return (
      <div
        style={{
          background: "rgba(18, 24, 33, 0.95)",
          border: `1px solid ${color}`,
          borderRadius: "14px",
          padding: "12px 16px",
          backdropFilter: "blur(10px)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
          fontSize: "13px",
          minWidth: "140px",
        }}
      >
        <div style={{ color, fontWeight: 600, marginBottom: 4 }}>
          {name}
        </div>
        <div style={{ color: "#CBD5E1" }}>
          Value: <strong>{value}</strong>
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
      <div className="grid gap-8 md:grid-cols-3">

        <StatsCard
          label="Total Active Cases"
          value={overview.totalActiveCases ?? 0}
          valueClassName="text-textPrimary"
        />

        <StatsCard
          label="Cases Closing Soon"
          value={overview.casesClosingSoon ?? 0}
          valueClassName="text-yellow-400"
        />

        <StatsCard
          label="Overdue Tasks"
          value={overview.overdueTasks ?? 0}
          valueClassName="text-red-500"
        />

      </div>

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
                <CartesianGrid stroke="#2A2F3A" strokeDasharray="3 3" />
                <XAxis dataKey="priority" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />

                <Tooltip
                  content={<CustomPriorityTooltip />}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />

                <Bar
                  dataKey="count"
                  radius={[8, 8, 0, 0]}
                  barSize={60}
                  animationDuration={400}
                >
                  <LabelList dataKey="count" position="top" fill="#9CA3AF" />
                  {safeArray(overview.casesByPriority).map((entry, index) => (
                    <Cell
                      key={index}
                      fill={PRIORITY_COLORS[entry.priority] || "#5A6472"}
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
                      fill={STATUS_COLORS[entry.status] || "#5A6472"}
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
                  <CartesianGrid stroke="#2A2F3A" strokeDasharray="3 3" />

                  <XAxis
                    dataKey="date"
                    stroke="#9CA3AF"
                    tickFormatter={(value) => {
                      const [year, month] = value.split("-");
                      const dateObj = new Date(Number(year), Number(month) - 1);

                      return dateObj.toLocaleString("default", {
                        month: "short",
                        year: "numeric",
                      });
                    }}
                  />

                  <YAxis stroke="#9CA3AF" />

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
                          <p className="text-sm text-primary mt-1">
                            Cases: <span className="font-semibold">{count}</span>
                          </p>
                        </div>
                      );
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#2F6F6F"
                    strokeWidth={2}
                    fillOpacity={0.2}
                    fill="#2F6F6F"
                  >
                    <LabelList
                      dataKey="count"
                      position="top"
                      fill="#9CA3AF"
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
                <p className="text-3xl font-semibold text-yellow-400">
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
                <p className="text-3xl font-semibold text-red-500">
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
                    ? "bg-red-900 text-red-300"
                    : overview.overdueTasks > 5
                    ? "bg-yellow-900 text-yellow-300"
                    : "bg-green-900 text-green-300"
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
                className="rounded-lg bg-accent px-6 py-2 text-sm font-medium text-black"
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