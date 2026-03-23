import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { AudiRings } from "../components/AudiLogo";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="min-h-screen bg-[#1C1C1C] flex items-center justify-center p-4">
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
          backgroundSize: "20px 20px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-sm"
      >
        {/* Card */}
        <div className="bg-[#222222] border border-[#2E2E2E] rounded-2xl p-8 shadow-2xl">
          {/* Audi Red top bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#BB0A21] rounded-t-2xl" />

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <AudiRings size={52} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Audi Test Drive
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Showroom Management System
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-zinc-400 text-xs text-center">
              Sign in with your Internet Identity to access the dashboard.
            </p>

            <button
              type="button"
              data-ocid="login.primary_button"
              onClick={() => login()}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-2 bg-[#BB0A21] hover:bg-[#D10F2A] text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-150 disabled:opacity-60"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                </>
              ) : (
                "Sign In with Internet Identity"
              )}
            </button>
          </div>

          <p className="text-zinc-600 text-xs text-center mt-6">
            Audi Showroom · Test Drive Tracking
          </p>
        </div>
      </motion.div>
    </div>
  );
}
