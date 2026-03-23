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
import { Loader2, MapPin, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { DealerLocation } from "../backend";
import {
  useAddDealerLocation,
  useDeleteDealerLocation,
  useListDealerLocations,
} from "../hooks/useQueries";

export function DealerLocations() {
  const { data: locations = [], isLoading } = useListDealerLocations();
  const add = useAddDealerLocation();
  const del = useDeleteDealerLocation();

  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DealerLocation | null>(null);
  const [form, setForm] = useState({
    name: "",
    city: "",
    address: "",
    phone: "",
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await add.mutateAsync(form);
      toast.success("Dealer location added");
      setAddOpen(false);
      setForm({ name: "", city: "", address: "", phone: "" });
    } catch {
      toast.error("Failed to add location");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await del.mutateAsync(deleteTarget.id);
      toast.success("Location deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Dealer Locations
        </h2>
        <Button
          data-ocid="dealer-locations.open_modal_button"
          onClick={() => setAddOpen(true)}
          className="bg-[#BB0A21] hover:bg-[#D10F2A] text-white text-xs"
        >
          <Plus size={14} className="mr-1" /> Add Location
        </Button>
      </div>

      <div className="bg-[#222222] border border-[#2E2E2E] rounded-xl overflow-hidden">
        {isLoading ? (
          <div
            className="flex justify-center py-12"
            data-ocid="dealer-locations.loading_state"
          >
            <Loader2 className="w-7 h-7 animate-spin text-[#BB0A21]" />
          </div>
        ) : locations.length === 0 ? (
          <div
            className="py-14 text-center"
            data-ocid="dealer-locations.empty_state"
          >
            <MapPin size={32} className="mx-auto mb-3 text-zinc-600" />
            <p className="text-zinc-500 text-sm">
              No dealer locations yet. Add your first location.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#2E2E2E] bg-[#1C1C1C]">
                  {["ID", "Name", "City", "Address", "Phone", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-zinc-500 font-medium"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {locations.map((l, i) => (
                  <tr
                    key={l.id.toString()}
                    data-ocid={`dealer-locations.item.${i + 1}`}
                    className="border-b border-[#2E2E2E]/50 hover:bg-[#2E2E2E]/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-zinc-500 font-mono">
                      #{l.id.toString()}
                    </td>
                    <td className="px-4 py-3 text-white font-semibold">
                      {l.name}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{l.city}</td>
                    <td className="px-4 py-3 text-zinc-400 max-w-[200px] truncate">
                      {l.address}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{l.phone}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        data-ocid={`dealer-locations.delete_button.${i + 1}`}
                        onClick={() => setDeleteTarget(l)}
                        className="text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent
          className="bg-[#222222] border-[#2E2E2E] text-white max-w-sm"
          data-ocid="dealer-locations.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-white">
              Add Dealer Location
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-zinc-400 text-xs">Location Name *</Label>
              <Input
                data-ocid="dealer-locations.input"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Audi Frankfurt Centre"
                className="bg-[#1C1C1C] border-[#2E2E2E] text-white text-xs h-8"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-zinc-400 text-xs">City *</Label>
                <Input
                  required
                  value={form.city}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, city: e.target.value }))
                  }
                  placeholder="e.g. Frankfurt"
                  className="bg-[#1C1C1C] border-[#2E2E2E] text-white text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-zinc-400 text-xs">Phone *</Label>
                <Input
                  required
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="+49 ..."
                  className="bg-[#1C1C1C] border-[#2E2E2E] text-white text-xs h-8"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-zinc-400 text-xs">Address *</Label>
              <Input
                required
                value={form.address}
                onChange={(e) =>
                  setForm((p) => ({ ...p, address: e.target.value }))
                }
                placeholder="Street, Postal Code"
                className="bg-[#1C1C1C] border-[#2E2E2E] text-white text-xs h-8"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setAddOpen(false)}
                className="text-zinc-400"
                data-ocid="dealer-locations.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={add.isPending}
                className="bg-[#BB0A21] hover:bg-[#D10F2A] text-white"
                data-ocid="dealer-locations.submit_button"
              >
                {add.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Add Location"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent
          className="bg-[#222222] border-[#2E2E2E]"
          data-ocid="dealer-locations.modal"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete Location?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Remove{" "}
              <strong className="text-white">{deleteTarget?.name}</strong> from
              dealer locations?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-[#2E2E2E] text-zinc-400 hover:bg-[#2E2E2E]"
              data-ocid="dealer-locations.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-[#C93B4B] hover:bg-red-600 text-white"
              data-ocid="dealer-locations.confirm_button"
            >
              {del.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
