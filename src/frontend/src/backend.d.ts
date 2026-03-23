import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DealerLocationInput {
    city: string;
    name: string;
    address: string;
    phone: string;
}
export type CarModelId = bigint;
export interface DealerLocation {
    id: DealerLocationId;
    city: string;
    name: string;
    address: string;
    phone: string;
}
export interface CarModel {
    id: CarModelId;
    name: string;
    color: string;
    available: boolean;
    category: string;
}
export interface CarModelInput {
    name: string;
    color: string;
    available: boolean;
    category: string;
}
export type DealerLocationId = bigint;
export interface TestDrive {
    id: TestDriveId;
    customerName: string;
    status: Variant_scheduled_cancelled_completed_inProgress;
    customerPhone: string;
    scheduledDate: string;
    userId: Principal;
    createdAt: bigint;
    carModelId: CarModelId;
    notes: string;
    dealerLocationId: DealerLocationId;
}
export type TestDriveId = bigint;
export interface TestDriveInput {
    customerName: string;
    customerPhone: string;
    scheduledDate: string;
    carModelId: CarModelId;
    notes: string;
    dealerLocationId: DealerLocationId;
}
export interface UserProfile {
    name: string;
}
export interface DashboardStats {
    scheduled: bigint;
    total: bigint;
    cancelled: bigint;
    completed: bigint;
    inProgress: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_scheduled_cancelled_completed_inProgress {
    scheduled = "scheduled",
    cancelled = "cancelled",
    completed = "completed",
    inProgress = "inProgress"
}
export interface backendInterface {
    /**
     * / -- Car model management --
     */
    addCarModel(input: CarModelInput): Promise<CarModelId>;
    /**
     * / -- Dealer location management --
     */
    addDealerLocation(input: DealerLocationInput): Promise<DealerLocationId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / -- Test drive management --
     */
    bookTestDrive(input: TestDriveInput): Promise<TestDriveId>;
    cancelTestDrive(testDriveId: TestDriveId): Promise<void>;
    /**
     * Claim Super Admin role by providing the admin token.
     * Returns true if successful, false if the token is incorrect.
     */
    claimSuperAdminByToken(token: string): Promise<boolean>;
    deleteCarModel(carModelId: CarModelId): Promise<void>;
    deleteDealerLocation(dealerLocationId: DealerLocationId): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    /**
     * / --- Types ---
     */
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<DashboardStats>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    /**
     * / --- User Profile ---
     */
    isCallerAdmin(): Promise<boolean>;
    listCarModels(): Promise<Array<CarModel>>;
    listDealerLocations(): Promise<Array<DealerLocation>>;
    listTestDrives(): Promise<Array<TestDrive>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleCarModelAvailability(carModelId: CarModelId): Promise<void>;
    updateTestDriveStatus(testDriveId: TestDriveId, newStatus: Variant_scheduled_cancelled_completed_inProgress): Promise<void>;
}
