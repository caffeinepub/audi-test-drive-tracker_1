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
import { Switch } from "@/components/ui/switch";
import { Car, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { CarModel } from "../backend";
import {
  useAddCarModel,
  useDeleteCarModel,
  useListCarModels,
  useToggleCarModelAvailability,
} from "../hooks/useQueries";

export function CarModels() {
  const { data: models = [], isLoading } = useListCarModels();
  const add = useAddCarModel();
  const del = useDeleteCarModel();
  const toggle = useToggleCarModelAvailability();

  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CarModel | null>(null);
  const [form, setForm] = useState({
    name: "",
    color: "",
    category: "",
    available: true,
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await add.mutateAsync({
        name: form.name,
        color: form.color,
        category: form.category,
        available: form.available,
      });
      toast.success("Car model added");
      setAddOpen(false);
      setForm({
        name: "",
        color: "",
        category: "",
        available: true,
      });
    } catch {
      toast.error("Failed to add car model");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await del.mutateAsync(deleteTarget.id);
      toast.success("Car model deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Car Model Lineup
        </h2>
        <Button
          data-ocid="car-models.open_modal_button"
          onClick={() => setAddOpen(true)}
          className="bg-[#BB0A21] hover:bg-[#D10F2A] text-white text-xs"
        >
          <Plus size={14} className="mr-1" /> Add Model
        </Button>
      </div>

      <div className="bg-[#222222] border border-[#2E2E2E] rounded-xl overflow-hidden">
        {isLoading ? (
          <div
            className="flex justify-center py-12"
            data-ocid="car-models.loading_state"
          >
            <Loader2 className="w-7 h-7 animate-spin text-[#BB0A21]" />
          </div>
        ) : models.length === 0 ? (
          <div className="py-14 text-center" data-ocid="car-models.empty_state">
            <Car size={32} className="mx-auto mb-3 text-zinc-600" />
            <p className="text-zinc-500 text-sm">
              No car models yet. Add your first model.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#2E2E2E] bg-[#1C1C1C]">
                  {[
                    "ID",
                    "Model Name",
                    "Color",
                    "Category",
                    "Available",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-zinc-500 font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {models.map((m, i) => (
                  <tr
                    key={m.id.toString()}
                    data-ocid={`car-models.item.${i + 1}`}
                    className="border-b border-[#2E2E2E]/50 hover:bg-[#2E2E2E]/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-zinc-500 font-mono">
                      #{m.id.toString()}
                    </td>
                    <td className="px-4 py-3 text-white font-semibold">
                      {m.name}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{m.color}</td>
                    <td className="px-4 py-3 text-zinc-400">{m.category}</td>
                    <td className="px-4 py-3">
                      <Switch
                        data-ocid={`car-models.switch.${i + 1}`}
                        checked={m.available}
                        onCheckedChange={() => toggle.mutate(m.id)}
                        className="data-[state=checked]:bg-[#2FA36A]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        data-ocid={`car-models.delete_button.${i + 1}`}
                        onClick={() => setDeleteTarget(m)}
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
          data-ocid="car-models.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-white">Add Car Model</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-zinc-400 text-xs">Model Name *</Label>
              <Input
                data-ocid="car-models.input"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Audi A6"
                className="bg-[#1C1C1C] border-[#2E2E2E] text-white text-xs h-8"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-zinc-400 text-xs">Color *</Label>
                <Input
                  required
                  value={form.color}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, color: e.target.value }))
                  }
                  placeholder="e.g. Glacier White"
                  className="bg-[#1C1C1C] border-[#2E2E2E] text-white text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-zinc-400 text-xs">Category *</Label>
                <Input
                  required
                  value={form.category}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, category: e.target.value }))
                  }
                  placeholder="e.g. Sedan"
                  className="bg-[#1C1C1C] border-[#2E2E2E] text-white text-xs h-8"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="available"
                checked={form.available}
                onCheckedChange={(v) =>
                  setForm((p) => ({ ...p, available: v }))
                }
                className="data-[state=checked]:bg-[#2FA36A]"
                data-ocid="car-models.switch"
              />
              <Label htmlFor="available" className="text-zinc-400 text-xs">
                Available for test drives
              </Label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setAddOpen(false)}
                className="text-zinc-400"
                data-ocid="car-models.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={add.isPending}
                className="bg-[#BB0A21] hover:bg-[#D10F2A] text-white"
                data-ocid="car-models.submit_button"
              >
                {add.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Add Model"
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
          data-ocid="car-models.modal"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete Car Model?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Remove{" "}
              <strong className="text-white">{deleteTarget?.name}</strong> from
              the lineup?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-[#2E2E2E] text-zinc-400 hover:bg-[#2E2E2E]"
              data-ocid="car-models.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-[#C93B4B] hover:bg-red-600 text-white"
              data-ocid="car-models.confirm_button"
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
