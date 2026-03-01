import { ReactNode } from "react";

interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    isLoading?: boolean;
}

export default function DataTable<T>({ data, columns, isLoading }: DataTableProps<T>) {
    if (isLoading) {
        return (
            <div className="w-full rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                    <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
                </div>
                <div className="divide-y divide-slate-100">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-4 flex gap-4">
                            <div className="h-4 w-1/4 bg-slate-100 rounded animate-pulse"></div>
                            <div className="h-4 w-1/4 bg-slate-100 rounded animate-pulse"></div>
                            <div className="h-4 w-1/4 bg-slate-100 rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                        <tr>
                            {columns.map((col, i) => (
                                <th key={i} className="px-6 py-4 whitespace-nowrap">
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-500">
                                    No records found.
                                </td>
                            </tr>
                        ) : (
                            data.map((item, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-slate-50/50 transition-colors pointer-events-none *:pointer-events-auto">
                                    {columns.map((col, colIndex) => (
                                        <td key={colIndex} className="px-6 py-4 text-slate-900 whitespace-nowrap">
                                            {col.cell ? col.cell(item) : (col.accessorKey ? String(item[col.accessorKey]) : null)}
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
