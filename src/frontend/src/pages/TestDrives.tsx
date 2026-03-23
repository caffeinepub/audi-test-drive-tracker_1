import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, RefreshCw, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { TestDrive } from "../backend";
import { StatusBadge } from "../components/StatusBadge";
import {
  Variant_scheduled_cancelled_completed_inProgress as Status,
  useBookTestDrive,
  useCancelTestDrive,
  useListCarModels,
  useListDealerLocations,
  useListTestDrives,
  useUpdateTestDriveStatus,
} from "../hooks/useQueries";

const ALL_STATUSES = [
  Status.scheduled,
  Status.inProgress,
  Status.completed,
  Status.cancelled,
];

interface TestDrivesProps {
  canBook: boolean;
  canAdmin: boolean;
}

export function TestDrives({ canBook, canAdmin }: TestDrivesProps) {
  const { data: drives = [], isLoading } = useListTestDrives();
  const { data: carModels = [] } = useListCarModels();
  const { data: locations = [] } = useListDealerLocations();
  const book = useBookTestDrive();
  const cancel = useCancelTestDrive();
  const updateStatus = useUpdateTestDriveStatus();

  const [filterTab, setFilterTab] = useState<"all" | Status>("all");
  const [bookOpen, setBookOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<TestDrive | null>(null);
  const [statusTarget, setStatusTarget] = useState<TestDrive | null>(null);
  const [newStatus, setNewStatus] = useState<Status>(Status.scheduled);

  // Book form state
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    scheduledDate: "",
    carModelId: "",
    dealerLocationId: "",
    notes: "",
  });

  const filtered =
    filterTab === "all" ? drives : drives.filter((d) => d.status === filterTab);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.carModelId || !form.dealerLocationId) return;
    try {
      await book.mutateAsync({
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        scheduledDate: form.scheduledDate,
        carModelId: BigInt(form.carModelId),
        dealerLocationId: BigInt(form.dealerLocationId),
        notes: form.notes,
      });
      toast.success("Test drive booked!");
      setBookOpen(false);
      setForm({
        customerName: "",
        customerPhone: "",
        scheduledDate: "",
        carModelId: "",
        dealerLocationId: "",
        notes: "",
      });
    } catch {
      toast.error("Failed to book test drive");
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await cancel.mutateAsync(cancelTarget.id);
      toast.success("Test drive cancelled");
      setCancelTarget(null);
    } catch {
      toast.error("Failed to cancel");
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusTarget) return;
    try {
      await updateStatus.mutateAsync({
        id: statusTarget.id,
        status: newStatus,
      });
      toast.success("Status updated");
      setStatusTarget(null);
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Tabs
          value={filterTab}
          onValueChange={(v) => setFilterTab(v as typeof filterTab)}
        >
          <TabsList
            className="bg-[#222222] border border-[#2E2E2E]"
            data-ocid="test-drives.filter.tab"
          >
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-[#BB0A21] data-[state=active]:text-white text-zinc-400 text-xs"
            >
              All
            </TabsTrigger>
            {ALL_STATUSES.map((s) => (
              <TabsTrigger
                key={s}
                value={s}
                className="data-[state=active]:bg-[#BB0A21] data-[state=active]:text-white text-zinc-400 text-xs capitalize"
              >
                {s === "inProgress" ? "In Progress" : s}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {canBook && (
          <Button
            data-ocid="test-drives.open_modal_button"
            onClick={() => setBookOpen(true)}
            className="bg-[#BB0A21] hover:bg-[#D10F2A] text-white text-xs"
          >
            <Plus size={14} className="mr-1" /> Book Test Drive
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#222222] border border-[#2E2E2E] rounded-xl overflow-hidden">
        {isLoading ? (
          <div
            className="flex justify-center py-12"
            data-ocid="test-drives.loading_state"
          >
            <Loader2 className="w-7 h-7 animate-spin text-[#BB0A21]" />
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="py-14 text-center text-zinc-500 text-sm"
            data-ocid="test-drives.empty_state"
          >
            No test drives found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#2E2E2E] bg-[#1C1C1C]">
                  {[
                    "ID",
                    "Customer",
                    "Phone",
                    "Model",
                    "Date",
                    "Status",
                    "Location",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-zinc-500 font-medium whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => (
                  <tr
                    key={d.id.toString()}
                    data-ocid={`test-drives.item.${i + 1}`}
                    className="border-b border-[#2E2E2E]/50 hover:bg-[#2E2E2E]/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-zinc-500 font-mono">
                      #{d.id.toString()}
                    </td>
                    <td className="px-4 py-3 text-white font-medium whitespace-nowrap">
                      {d.customerName}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {d.customerPhone}
                    </td>
                    <td className="px-4 py-3 text-zinc-300 whitespace-nowrap">
                      {carModels.find((m) => m.id === d.carModelId)?.name ??
                        `#${d.carModelId.toString()}`}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                      {d.scheduledDate}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={d.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                      {locations.find((l) => l.id === d.dealerLocationId)
                        ?.city ?? `#${d.dealerLocationId.toString()}`}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {(canBook || canAdmin) &&
                          d.status !== Status.cancelled && (
                            <>
                              <button
                                type="button"
                                data-ocid={`test-drives.edit_button.${i + 1}`}
                                onClick={() => {
                                  setStatusTarget(d);
                                  setNewStatus(d.status);
                                }}
                                className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                              >
                                <RefreshCw size={11} /> Status
                              </button>
                              <button
                                type="button"
                                data-ocid={`test-drives.delete_button.${i + 1}`}
                                onClick={() => setCancelTarget(d)}
                                className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1"
                              >
                                <XCircle size={11} /> Cancel
                              </button>
                            </>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Book Modal */}
      <Dialog open={bookOpen} onOpenChange={setBookOpen}>
        <DialogContent
          className="bg-[#222222] border-[#2E2E2E] text-white max-w-md"
          data-ocid="test-drives.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-white">Book Test Drive</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBook} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-zinc-400 text-xs">Customer Name *</Label>
                <Input
                  data-ocid="test-drives.input"
                  required
                  value={form.customerName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, customerName: e.target.value }))
                  }
                  className="bg-[#1C1C1C] border-[#2E2E2E] text-white text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-zinc-400 text-xs">Phone *</Label>
                <Input
                  required
                  value={form.customerPhone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, customerPhone: e.target.value }))
                  }
                  className="bg-[#1C1C1C] border-[#2E2E2E] text-white text-xs h-8"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-zinc-400 text-xs">Scheduled Date *</Label>
              <Input
                type="datetime-local"
                required
                value={form.scheduledDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, scheduledDate: e.target.value }))
                }
                className="bg-[#1C1C1C] border-[#2E2E2E] text-white text-xs h-8"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-zinc-400 text-xs">Car Model *</Label>
                <Select
                  value={form.carModelId}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, carModelId: v }))
                  }
                >
                  <SelectTrigger
                    className="bg-[#1C1C1C] border-[#2E2E2E] text-white text-xs h-8"
                    data-ocid="test-drives.select"
                  >
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#222222] border-[#2E2E2E]">
                    {carModels
                      .filter((m) => m.available)
                      .map((m) => (
                        <SelectItem
                          key={m.id.toString()}
                          value={m.id.toString()}
                          className="text-white hover:bg-[#2E2E2E] text-xs"
                        >
                          {m.name}
                          {m.color ? ` (${m.color})` : ""}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-zinc-400 text-xs">Location *</Label>
                <Select
                  value={form.dealerLocationId}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, dealerLocationId: v }))
                  }
                >
                  <SelectTrigger className="bg-[#1C1C1C] border-[#2E2E2E] text-white text-xs h-8">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#222222] border-[#2E2E2E]">
                    {locations.map((l) => (
                      <SelectItem
                        key={l.id.toString()}
                        value={l.id.toString()}
                        className="text-white hover:bg-[#2E2E2E] text-xs"
                      >
                        {l.name}, {l.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-zinc-400 text-xs">Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                className="bg-[#1C1C1C] border-[#2E2E2E] text-white text-xs resize-none h-16"
                placeholder="Optional notes..."
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setBookOpen(false)}
                className="text-zinc-400 hover:text-white"
                data-ocid="test-drives.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  book.isPending || !form.carModelId || !form.dealerLocationId
                }
                className="bg-[#BB0A21] hover:bg-[#D10F2A] text-white"
                data-ocid="test-drives.submit_button"
              >
                {book.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    Booking...
                  </>
                ) : (
                  "Book"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirm */}
      <AlertDialog
        open={!!cancelTarget}
        onOpenChange={(o) => !o && setCancelTarget(null)}
      >
        <AlertDialogContent
          className="bg-[#222222] border-[#2E2E2E]"
          data-ocid="test-drives.modal"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Cancel Test Drive?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Are you sure you want to cancel the test drive for{" "}
              <strong className="text-white">
                {cancelTarget?.customerName}
              </strong>
              ? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-[#2E2E2E] text-zinc-400 hover:bg-[#2E2E2E]"
              data-ocid="test-drives.cancel_button"
            >
              Keep
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-[#C93B4B] hover:bg-red-600 text-white"
              data-ocid="test-drives.confirm_button"
            >
              {cancel.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Yes, Cancel"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update Status */}
      <Dialog
        open={!!statusTarget}
        onOpenChange={(o) => !o && setStatusTarget(null)}
      >
        <DialogContent
          className="bg-[#222222] border-[#2E2E2E] text-white max-w-xs"
          data-ocid="test-drives.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-white">Update Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Select
              value={newStatus}
              onValueChange={(v) => setNewStatus(v as Status)}
            >
              <SelectTrigger
                className="bg-[#1C1C1C] border-[#2E2E2E] text-white"
                data-ocid="test-drives.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#222222] border-[#2E2E2E]">
                {ALL_STATUSES.map((s) => (
                  <SelectItem
                    key={s}
                    value={s}
                    className="text-white hover:bg-[#2E2E2E] capitalize"
                  >
                    {s === "inProgress" ? "In Progress" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setStatusTarget(null)}
              className="text-zinc-400"
              data-ocid="test-drives.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={updateStatus.isPending}
              className="bg-[#BB0A21] hover:bg-[#D10F2A] text-white"
              data-ocid="test-drives.save_button"
            >
              {updateStatus.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Update"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
