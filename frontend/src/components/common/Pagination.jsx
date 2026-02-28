import React from 'react';

function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
      <div>
        Page {page} of {totalPages}
      </div>
      <div className="space-x-2">
        <button
          type="button"
          onClick={() => canPrev && onPageChange(page - 1)}
          disabled={!canPrev}
          className="rounded-md border border-slate-700 px-2 py-1 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => canNext && onPageChange(page + 1)}
          disabled={!canNext}
          className="rounded-md border border-slate-700 px-2 py-1 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Pagination;

