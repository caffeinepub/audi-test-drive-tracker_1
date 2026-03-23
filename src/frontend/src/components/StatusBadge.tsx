import { Variant_scheduled_cancelled_completed_inProgress as Status } from "../hooks/useQueries";

const statusConfig: Record<
  Status,
  { label: string; bg: string; text: string; dot: string }
> = {
  [Status.scheduled]: {
    label: "Scheduled",
    bg: "bg-[#C98A2D]/15",
    text: "text-[#C98A2D]",
    dot: "bg-[#C98A2D]",
  },
  [Status.inProgress]: {
    label: "In Progress",
    bg: "bg-[#2E6FCE]/15",
    text: "text-[#2E6FCE]",
    dot: "bg-[#2E6FCE]",
  },
  [Status.completed]: {
    label: "Completed",
    bg: "bg-[#2FA36A]/15",
    text: "text-[#2FA36A]",
    dot: "bg-[#2FA36A]",
  },
  [Status.cancelled]: {
    label: "Cancelled",
    bg: "bg-[#C93B4B]/15",
    text: "text-[#C93B4B]",
    dot: "bg-[#C93B4B]",
  },
};

export function StatusBadge({
  status,
  size = "md",
}: { status: Status; size?: "sm" | "md" | "lg" }) {
  const cfg = statusConfig[status] ?? statusConfig[Status.scheduled];
  const padding =
    size === "lg"
      ? "px-4 py-2 text-sm"
      : size === "sm"
        ? "px-2 py-0.5 text-[10px]"
        : "px-3 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${padding} ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export { statusConfig };
