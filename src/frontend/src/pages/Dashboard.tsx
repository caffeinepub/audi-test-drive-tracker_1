import { Activity, CalendarCheck, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { StatusBadge } from "../components/StatusBadge";
import { useGetDashboardStats, useListTestDrives } from "../hooks/useQueries";
import { Variant_scheduled_cancelled_completed_inProgress as Status } from "../hooks/useQueries";

const kpiConfig = [
  {
    key: "scheduled" as const,
    label: "Scheduled",
    color: "#C98A2D",
    bg: "bg-[#C98A2D]/10",
    bar: "bg-[#C98A2D]",
    status: Status.scheduled,
  },
  {
    key: "inProgress" as const,
    label: "In Progress",
    color: "#2E6FCE",
    bg: "bg-[#2E6FCE]/10",
    bar: "bg-[#2E6FCE]",
    status: Status.inProgress,
  },
  {
    key: "completed" as const,
    label: "Completed",
    color: "#2FA36A",
    bg: "bg-[#2FA36A]/10",
    bar: "bg-[#2FA36A]",
    status: Status.completed,
  },
  {
    key: "cancelled" as const,
    label: "Cancelled",
    color: "#C93B4B",
    bg: "bg-[#C93B4B]/10",
    bar: "bg-[#C93B4B]",
    status: Status.cancelled,
  },
];

export function Dashboard() {
  const stats = useGetDashboardStats();
  const drives = useListTestDrives();

  const recentDrives = (drives.data ?? []).slice(-10).reverse();

  if (stats.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2
          className="w-8 h-8 animate-spin text-[#BB0A21]"
          data-ocid="dashboard.loading_state"
        />
      </div>
    );
  }

  const s = stats.data;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
          Test Drives Overview
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiConfig.map((cfg, i) => (
            <motion.div
              key={cfg.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              data-ocid={`dashboard.${cfg.key}.card`}
              className="relative bg-[#222222] border border-[#2E2E2E] rounded-xl p-4 overflow-hidden"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-full ${cfg.bg} flex items-center justify-center`}
                >
                  <CalendarCheck size={16} style={{ color: cfg.color }} />
                </div>
              </div>
              <div
                className="text-3xl font-bold tabular-nums"
                style={{ color: cfg.color }}
              >
                {s ? Number(s[cfg.key]).toString() : "—"}
              </div>
              <p className="text-xs text-zinc-400 mt-1 font-medium">
                {cfg.label}
              </p>
              <p className="text-[10px] text-zinc-600 mt-0.5">
                of {s ? Number(s.total).toString() : "—"} total
              </p>
              {/* Bottom bar */}
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: cfg.color }}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Test Drives + Live Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Table */}
        <div className="xl:col-span-2 bg-[#222222] border border-[#2E2E2E] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2E2E2E] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">
              Recent Bookings
            </h3>
            <span className="text-[10px] text-zinc-500">Last 10</span>
          </div>
          {drives.isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#BB0A21]" />
            </div>
          ) : recentDrives.length === 0 ? (
            <div
              className="py-12 text-center text-zinc-500 text-sm"
              data-ocid="dashboard.empty_state"
            >
              No test drives yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#2E2E2E]">
                    {["ID", "Customer", "Model", "Date", "Status"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left text-zinc-500 font-medium"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentDrives.map((d, i) => (
                    <tr
                      key={d.id.toString()}
                      data-ocid={`dashboard.item.${i + 1}`}
                      className="border-b border-[#2E2E2E]/50 hover:bg-[#2E2E2E]/30 transition-colors"
                    >
                      <td className="px-4 py-2.5 text-zinc-500">
                        #{d.id.toString()}
                      </td>
                      <td className="px-4 py-2.5 text-white font-medium">
                        {d.customerName}
                      </td>
                      <td className="px-4 py-2.5 text-zinc-300">
                        Model #{d.carModelId.toString()}
                      </td>
                      <td className="px-4 py-2.5 text-zinc-400">
                        {d.scheduledDate}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={d.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Live Activity */}
        <div className="bg-[#222222] border border-[#2E2E2E] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2E2E2E] flex items-center gap-2">
            <Activity size={14} className="text-[#BB0A21]" />
            <h3 className="text-sm font-semibold text-white">Live Activity</h3>
            <span className="ml-auto w-2 h-2 rounded-full bg-[#2FA36A] animate-pulse" />
          </div>
          <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
            {recentDrives.length === 0 ? (
              <p
                className="text-zinc-500 text-xs text-center py-4"
                data-ocid="dashboard.activity.empty_state"
              >
                No recent activity
              </p>
            ) : (
              recentDrives.slice(0, 8).map((d, i) => (
                <motion.div
                  key={d.id.toString()}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  data-ocid={`dashboard.activity.item.${i + 1}`}
                  className="flex items-center gap-3"
                >
                  <div className="w-7 h-7 rounded-full bg-[#BB0A21]/15 flex items-center justify-center text-[#BB0A21] text-[10px] font-bold flex-shrink-0">
                    {d.customerName[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white truncate">
                      {d.customerName}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {d.scheduledDate}
                    </p>
                  </div>
                  <StatusBadge status={d.status} size="sm" />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
