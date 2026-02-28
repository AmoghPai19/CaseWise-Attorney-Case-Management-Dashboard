const styles = {
  Open: "bg-green-500/20 text-green-400",
  Pending: "bg-yellow-500/20 text-yellow-400",
  Closed: "bg-gray-500/20 text-gray-300",
  High: "bg-red-500/20 text-red-400",
  Medium: "bg-yellow-500/20 text-yellow-400",
  Low: "bg-green-500/20 text-green-400"
};

export default function StatusBadge({ status }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs ${styles[status] || "bg-gray-700 text-gray-300"}`}>
      {status}
    </span>
  );
}