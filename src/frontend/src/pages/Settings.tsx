import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useIsCallerAdmin,
  useSaveCallerUserProfile,
} from "../hooks/useQueries";

export function Settings() {
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const save = useSaveCallerUserProfile();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const [name, setName] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [claimPending, setClaimPending] = useState(false);

  useEffect(() => {
    if (profile?.name) setName(profile.name);
  }, [profile?.name]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await save.mutateAsync({ name: name.trim() });
      toast.success("Profile saved");
    } catch {
      toast.error("Failed to save profile");
    }
  };

  const handleClaimAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken.trim() || !actor) return;
    setClaimPending(true);
    try {
      const success = await actor.claimSuperAdminByToken(adminToken.trim());
      if (success) {
        toast.success("Super Admin role claimed. Please refresh the page.");
        setAdminToken("");
      } else {
        toast.error("Invalid admin token. Please check and try again.");
      }
    } catch {
      toast.error("Failed to claim admin role.");
    } finally {
      setClaimPending(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <Card className="bg-[#222222] border-[#2E2E2E]">
        <CardHeader>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <User size={16} className="text-[#BB0A21]" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div
              className="flex justify-center py-6"
              data-ocid="settings.loading_state"
            >
              <Loader2 className="w-6 h-6 animate-spin text-[#BB0A21]" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs">Display Name</Label>
                <Input
                  data-ocid="settings.input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="bg-[#1C1C1C] border-[#2E2E2E] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs">Principal ID</Label>
                <p className="text-zinc-500 text-xs font-mono bg-[#1C1C1C] border border-[#2E2E2E] rounded-lg px-3 py-2 break-all">
                  {identity?.getPrincipal().toString() ?? "—"}
                </p>
              </div>
              <Button
                type="submit"
                data-ocid="settings.submit_button"
                disabled={!name.trim() || save.isPending}
                className="bg-[#BB0A21] hover:bg-[#D10F2A] text-white"
              >
                {save.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {!isAdmin && (
        <Card className="bg-[#222222] border-[#2E2E2E]">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#BB0A21]" />
              Claim Super Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-500 text-xs mb-4">
              If you are the app owner, enter the admin token to claim Super
              Admin access for your account.
            </p>
            <form onSubmit={handleClaimAdmin} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs">Admin Token</Label>
                <Input
                  type="password"
                  value={adminToken}
                  onChange={(e) => setAdminToken(e.target.value)}
                  placeholder="Enter admin token"
                  className="bg-[#1C1C1C] border-[#2E2E2E] text-white"
                />
              </div>
              <Button
                type="submit"
                disabled={!adminToken.trim() || claimPending}
                className="bg-[#BB0A21] hover:bg-[#D10F2A] text-white"
              >
                {claimPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Claiming...
                  </>
                ) : (
                  "Claim Super Admin"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <p className="text-zinc-700 text-xs text-center">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          className="text-zinc-500 hover:text-zinc-300 underline"
          target="_blank"
          rel="noreferrer"
        >
          caffeine.ai
        </a>
      </p>
    </div>
  );
}
