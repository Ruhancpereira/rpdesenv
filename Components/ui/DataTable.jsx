function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function normalizeColumns(columns) {
  if (!Array.isArray(columns)) return [];
  if (columns.length === 0) return [];

  if (typeof columns[0] === "string") {
    return columns.map((label, index) => ({
      key: `col_${index}`,
      label,
      render: (row) => (Array.isArray(row) ? row[index] : row?.[`col_${index}`]),
    }));
  }

  return columns.map((column, index) => ({
    key: column.key || `col_${index}`,
    label: column.label || column.key || `Coluna ${index + 1}`,
    render: column.render,
    className: column.className,
  }));
}

export default function DataTable({
  title,
  subtitle,
  columns = [],
  data,
  rows,
  emptyText,
  emptyMessage,
}) {
  const normalizedColumns = normalizeColumns(columns);
  const normalizedRows = Array.isArray(data) ? data : Array.isArray(rows) ? rows : [];
  const emptyLabel = emptyMessage || emptyText || "Sem dados para exibir.";

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
      {title ? (
        <div className="border-b border-slate-800 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          {subtitle ? <p className="mt-1 text-xs text-slate-400">{subtitle}</p> : null}
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-900">
            <tr>
              {normalizedColumns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-400",
                    column.className,
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {normalizedRows.length === 0 ? (
              <tr>
                <td colSpan={normalizedColumns.length || 1} className="px-3 py-6 text-center text-slate-400">
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              normalizedRows.map((row, rowIndex) => (
                <tr key={row?.id || rowIndex} className="hover:bg-slate-800/40">
                  {normalizedColumns.map((column) => (
                    <td key={column.key} className={cn("px-3 py-2 align-top text-slate-200", column.className)}>
                      {column.render ? column.render(row) : row?.[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
