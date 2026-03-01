import clsx from "clsx";

interface StatusBadgeProps {
    status: "pending" | "accepted_by_doctor" | "confirmed" | "cancelled";
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const statusStyles = {
        pending: "bg-warning/10 text-warning",
        accepted_by_doctor: "bg-secondary/10 text-secondary",
        confirmed: "bg-success/10 text-success",
        cancelled: "bg-error/10 text-error",
    };

    const statusLabels = {
        pending: "Pending",
        accepted_by_doctor: "Accepted",
        confirmed: "Confirmed",
        cancelled: "Cancelled",
    };

    return (
        <span
            className={clsx(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                statusStyles[status]
            )}
        >
            {statusLabels[status]}
        </span>
    );
}
