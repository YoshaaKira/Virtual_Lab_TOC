interface Column {
  key: string;
  label: string;
}

interface TransitionTableProps {
  columns: Column[];
  rows: Record<string, string>[];
  highlightRowId?: string | null;
  rowIdKey?: string;
}

export default function TransitionTable({ columns, rows, highlightRowId, rowIdKey = 'id' }: TransitionTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-800 border-b border-gray-700">
            {columns.map(col => (
              <th key={col.key} className="px-3 py-2 text-left text-gray-400 font-medium">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-4 text-center text-gray-500 italic">
                No transitions defined
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr
                key={row[rowIdKey] ?? idx}
                className={`border-b border-gray-800 transition-colors ${
                  row[rowIdKey] === highlightRowId
                    ? 'bg-blue-900/40 text-blue-300'
                    : 'hover:bg-gray-800/50'
                }`}
              >
                {columns.map(col => (
                  <td key={col.key} className="px-3 py-2 font-mono">
                    {row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
