import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { type AppPage, Layout } from "./components/Layout";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  UserRole,
  useGetCallerUserProfile,
  useGetCallerUserRole,
  useIsCallerAdmin,
} from "./hooks/useQueries";
import { CarModels } from "./pages/CarModels";
import { Dashboard } from "./pages/Dashboard";
import { DealerLocations } from "./pages/DealerLocations";
import { LoginPage } from "./pages/LoginPage";
import { ProfileSetupModal } from "./pages/ProfileSetupModal";
import { Settings } from "./pages/Settings";
import { TestDrives } from "./pages/TestDrives";
import { UsersPage } from "./pages/Users";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 10000, retry: 1 } },
});

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [currentPage, setCurrentPage] = useState<AppPage>("dashboard");

  const {
    data: profile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: callerRole, isLoading: roleLoading } = useGetCallerUserRole();

  const isSuperAdmin = isAdmin === true;
  const effectiveRole: "superadmin" | "admin" | "user" = isSuperAdmin
    ? "superadmin"
    : callerRole === UserRole.admin
      ? "admin"
      : "user";

  const isAppLoading =
    isInitializing ||
    (isAuthenticated && (profileLoading || adminLoading || roleLoading));

  const showProfileSetup =
    isAuthenticated && !profileLoading && profileFetched && profile === null;

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#1C1C1C] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#BB0A21]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (isAppLoading) {
    return (
      <div className="min-h-screen bg-[#1C1C1C] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#BB0A21]" />
        <p className="text-zinc-500 text-sm">Loading dashboard...</p>
      </div>
    );
  }

  const canBook = effectiveRole === "superadmin" || effectiveRole === "user";
  const canAdmin = effectiveRole === "superadmin" || effectiveRole === "admin";
  const canManageModels =
    effectiveRole === "superadmin" || effectiveRole === "admin";
  const canManageUsers =
    effectiveRole === "superadmin" || effectiveRole === "admin";

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "test-drives":
        return <TestDrives canBook={canBook} canAdmin={canAdmin} />;
      case "car-models":
        return canManageModels ? <CarModels /> : <AccessDenied />;
      case "dealer-locations":
        return canManageModels ? <DealerLocations /> : <AccessDenied />;
      case "users":
        return canManageUsers ? (
          <UsersPage isSuperAdmin={isSuperAdmin} />
        ) : (
          <AccessDenied />
        );
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <ProfileSetupModal open={showProfileSetup} />
      <Layout
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        userRole={effectiveRole}
        profile={profile ?? null}
      >
        {renderPage()}
      </Layout>
    </>
  );
}

function AccessDenied() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-[#C93B4B] text-lg font-semibold mb-1">
          Access Denied
        </p>
        <p className="text-zinc-500 text-sm">
          You don&apos;t have permission to view this section.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster theme="dark" richColors />
    </QueryClientProvider>
  );
}
