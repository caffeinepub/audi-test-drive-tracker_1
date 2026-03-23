import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type CarModelInput,
  type DealerLocationInput,
  type TestDriveInput,
  type UserProfile,
  UserRole,
  Variant_scheduled_cancelled_completed_inProgress,
} from "../backend";
import { useActor } from "./useActor";

export { UserRole, Variant_scheduled_cancelled_completed_inProgress };

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["currentUserProfile"] }),
  });
}

export function useGetDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useListTestDrives() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["testDrives"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.listTestDrives();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
  });
}

export function useBookTestDrive() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TestDriveInput) => {
      if (!actor) throw new Error("Actor not available");
      return actor.bookTestDrive(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["testDrives"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useCancelTestDrive() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.cancelTestDrive(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["testDrives"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateTestDriveStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: bigint;
      status: Variant_scheduled_cancelled_completed_inProgress;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateTestDriveStatus(id, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["testDrives"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useListCarModels() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["carModels"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.listCarModels();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCarModel() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CarModelInput) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addCarModel(input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["carModels"] }),
  });
}

export function useDeleteCarModel() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteCarModel(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["carModels"] }),
  });
}

export function useToggleCarModelAvailability() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.toggleCarModelAvailability(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["carModels"] }),
  });
}

export function useListDealerLocations() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["dealerLocations"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.listDealerLocations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddDealerLocation() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: DealerLocationInput) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addDealerLocation(input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dealerLocations"] }),
  });
}

export function useDeleteDealerLocation() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteDealerLocation(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dealerLocations"] }),
  });
}

export function useAssignUserRole() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
