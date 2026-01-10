import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

export default function DataTable({
  columns,
  data,
  isLoading,
  page,
  totalPages,
  onPageChange,
  onRowChange,
}) {
  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-purple-600 to-purple-700">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {data?.length > 0 ? (
                table.getRowModel().rows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`
                      transition-colors duration-150 ease-in-out
                      ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      hover:bg-purple-50 cursor-pointer
                    `}
                    onClick={() => onRowChange && onRowChange(row.original._id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                        title="Click to view details"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <svg
                        className="w-16 h-16 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-gray-500 font-medium">
                        No data available
                      </p>
                      <p className="text-gray-400 text-sm">
                        Try adjusting your filters or check back later
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="
                inline-flex items-center gap-2 px-4 py-2 
                text-sm font-medium text-gray-700
                bg-white border border-gray-300 rounded-md
                hover:bg-gray-50 hover:border-purple-300
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white
                transition-all duration-200
              "
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Page</span>
              <span className="px-3 py-1 text-sm font-semibold text-purple-700 bg-purple-100 rounded-md">
                {page}
              </span>
              <span className="text-sm text-gray-600">
                of {totalPages || 1}
              </span>
            </div>

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="
                inline-flex items-center gap-2 px-4 py-2
                text-sm font-medium text-gray-700
                bg-white border border-gray-300 rounded-md
                hover:bg-gray-50 hover:border-purple-300
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white
                transition-all duration-200
              "
            >
              Next
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
