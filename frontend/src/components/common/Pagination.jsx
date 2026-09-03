import React from 'react';

function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between text-xs text-textSecondary">
      <div>
        Page {page} of {totalPages}
      </div>
      <div className="space-x-2">
        <button
          type="button"
          onClick={() => canPrev && onPageChange(page - 1)}
          disabled={!canPrev}
          className="rounded-md border border-border px-2 py-1 text-textSecondary hover:text-textPrimary hover:border-accent transition disabled:opacity-40 disabled:hover:text-textSecondary disabled:hover:border-border"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => canNext && onPageChange(page + 1)}
          disabled={!canNext}
          className="rounded-md border border-border px-2 py-1 text-textSecondary hover:text-textPrimary hover:border-accent transition disabled:opacity-40 disabled:hover:text-textSecondary disabled:hover:border-border"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Pagination;