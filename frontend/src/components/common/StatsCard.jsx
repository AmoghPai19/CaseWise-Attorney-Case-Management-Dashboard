import React from "react";

function StatsCard({ label, value, sublabel, valueClassName = "text-accent" }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-8 shadow-soft transition-colors hover:bg-surfaceHover">
      
      <p className="text-xs font-medium uppercase tracking-wider text-textSecondary">
        {label}
      </p>

      <p className={`mt-5 text-4xl font-semibold ${valueClassName}`}>
        {value}
      </p>

      {sublabel && (
        <p className="mt-2 text-sm text-textSecondary">
          {sublabel}
        </p>
      )}
    </div>
  );
}

export default StatsCard;