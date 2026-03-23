import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { AudiRings } from "../components/AudiLogo";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

export function ProfileSetupModal({ open }: { open: boolean }) {
  const [name, setName] = useState("");
  const save = useSaveCallerUserProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    save.mutate({ name: name.trim() });
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="bg-[#222222] border-[#2E2E2E] text-white max-w-sm"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <AudiRings size={40} />
          </div>
          <DialogTitle className="text-center text-white">
            Set Up Your Profile
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="profileName" className="text-zinc-300">
              Your Name
            </Label>
            <Input
              id="profileName"
              data-ocid="profile.input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="bg-[#1C1C1C] border-[#2E2E2E] text-white placeholder:text-zinc-600"
              autoFocus
            />
          </div>
          <Button
            type="submit"
            data-ocid="profile.submit_button"
            disabled={!name.trim() || save.isPending}
            className="w-full bg-[#BB0A21] hover:bg-[#D10F2A] text-white"
          >
            {save.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
