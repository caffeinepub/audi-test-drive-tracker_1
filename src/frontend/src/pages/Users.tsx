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
import { Principal } from "@icp-sdk/core/principal";
import { Loader2, Plus, Users as UsersIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole, useAssignUserRole } from "../hooks/useQueries";

interface UsersPageProps {
  isSuperAdmin: boolean;
}

export function UsersPage({ isSuperAdmin }: UsersPageProps) {
  const assign = useAssignUserRole();
  const [open, setOpen] = useState(false);
  const [principal, setPrincipal] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.user);
  const [principalError, setPrincipalError] = useState("");

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrincipalError("");
    let p: Principal;
    try {
      p = Principal.fromText(principal.trim());
    } catch {
      setPrincipalError("Invalid principal ID format");
      return;
    }
    try {
      await assign.mutateAsync({ user: p, role });
      toast.success(`Role '${role}' assigned successfully`);
      setOpen(false);
      setPrincipal("");
      setRole(UserRole.user);
    } catch {
      toast.error("Failed to assign role");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          User Management
        </h2>
        <Button
          data-ocid="users.open_modal_button"
          onClick={() => setOpen(true)}
          className="bg-[#BB0A21] hover:bg-[#D10F2A] text-white text-xs"
        >
          <Plus size={14} className="mr-1" /> Assign Role
        </Button>
      </div>

      {/* Info card */}
      <div
        className="bg-[#222222] border border-[#2E2E2E] rounded-xl p-6 text-center"
        data-ocid="users.panel"
      >
        <UsersIcon size={32} className="mx-auto mb-3 text-zinc-600" />
        <p className="text-zinc-400 text-sm font-medium mb-1">
          Role Assignment
        </p>
        <p className="text-zinc-600 text-xs max-w-sm mx-auto">
          Assign roles to users by entering their Internet Identity principal.
          {isSuperAdmin
            ? " As Super Admin, you can assign both 'admin' and 'user' roles."
            : " As Admin, you can assign the 'user' role only."}
        </p>
      </div>

      {/* Role legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            role: "Super Admin",
            desc: "Full access: manage everything, book test drives",
            color: "bg-[#BB0A21]/15 border-[#BB0A21]/30",
            text: "text-[#BB0A21]",
          },
          {
            role: "Admin",
            desc: "Manage models, locations, users, update test drive status",
            color: "bg-blue-500/10 border-blue-500/20",
            text: "text-blue-400",
          },
          {
            role: "User",
            desc: "Book, cancel, and update status of test drives",
            color: "bg-zinc-700/30 border-zinc-600/20",
            text: "text-zinc-300",
          },
        ].map((r) => (
          <div key={r.role} className={`rounded-xl border p-4 ${r.color}`}>
            <p className={`text-sm font-semibold mb-1 ${r.text}`}>{r.role}</p>
            <p className="text-zinc-500 text-xs">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Assign Role Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="bg-[#222222] border-[#2E2E2E] text-white max-w-sm"
          data-ocid="users.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-white">Assign User Role</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssign} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-zinc-400 text-xs">Principal ID *</Label>
              <Input
                data-ocid="users.input"
                required
                value={principal}
                onChange={(e) => {
                  setPrincipal(e.target.value);
                  setPrincipalError("");
                }}
                placeholder="xxxxx-xxxxx-..."
                className="bg-[#1C1C1C] border-[#2E2E2E] text-white text-xs h-8 font-mono"
              />
              {principalError && (
                <p
                  className="text-red-400 text-[10px]"
                  data-ocid="users.error_state"
                >
                  {principalError}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-zinc-400 text-xs">Role *</Label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as UserRole)}
              >
                <SelectTrigger
                  className="bg-[#1C1C1C] border-[#2E2E2E] text-white text-xs h-8"
                  data-ocid="users.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#222222] border-[#2E2E2E]">
                  {isSuperAdmin && (
                    <SelectItem
                      value={UserRole.admin}
                      className="text-white hover:bg-[#2E2E2E] text-xs"
                    >
                      Admin
                    </SelectItem>
                  )}
                  <SelectItem
                    value={UserRole.user}
                    className="text-white hover:bg-[#2E2E2E] text-xs"
                  >
                    User
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="text-zinc-400"
                data-ocid="users.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={assign.isPending}
                className="bg-[#BB0A21] hover:bg-[#D10F2A] text-white"
                data-ocid="users.submit_button"
              >
                {assign.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Assign Role"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
