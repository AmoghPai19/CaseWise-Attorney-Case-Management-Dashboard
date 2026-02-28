import React, { useEffect, useState } from "react";
import { useAuth } from "../../state/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // 🔎 Debounced search
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      try {
        const res = await api.get(`/search?q=${query}`);
        setResults(res.data);
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  const handleSelect = (item) => {
    setQuery("");
    setResults([]);
    setShowDropdown(false);

    if (item.type === "case") navigate(`/cases/${item.id}`);
    if (item.type === "client") navigate(`/clients/${item.id}`);
    if (item.type === "document") navigate(`/documents/${item.id}`);
  };

  return (
    <header className="relative flex h-16 items-center justify-between border-b border-border bg-surface px-10">
      
      {/* SEARCH */}
      <div className="relative w-96">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setShowDropdown(true)}
          placeholder="Search cases, clients, documents..."
          className="w-full rounded-lg bg-background border border-border px-4 py-2 text-sm text-textPrimary placeholder:text-textSecondary focus:outline-none focus:ring-1 focus:ring-accent"
        />

        {/* Dropdown Results */}
        {showDropdown && results.length > 0 && (
          <div className="absolute z-50 mt-2 w-full rounded-lg border border-border bg-surface shadow-soft">
            {results.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className="cursor-pointer px-4 py-2 text-sm text-textPrimary hover:bg-surfaceHover transition-colors"
              >
                <span className="mr-2 text-xs uppercase text-textSecondary">
                  {item.type}
                </span>
                {item.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* USER INFO */}
      <div className="flex items-center gap-8 text-sm">
        <div className="text-right">
          <p className="font-medium text-textPrimary">
            {user?.name}
          </p>
          <p className="text-xs text-textSecondary">
            {user?.role}
          </p>
        </div>

        <button
          onClick={logout}
          className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-textSecondary transition-colors hover:bg-surfaceHover hover:text-textPrimary"
        >
          Logout
        </button>
      </div>
    </header>
  );
}