import Map "mo:core/Map";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import List "mo:core/List";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Set "mo:core/Set";
import Prim "mo:prim";

actor {
  /// --- Types ---
  type CarModelId = Nat;
  type DealerLocationId = Nat;
  type TestDriveId = Nat;

  /// --- Authorization ---
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  /// Claim the Super Admin role by providing the admin token.
  /// This allows the legitimate owner to reclaim admin access at any time.
  public shared ({ caller }) func claimSuperAdminByToken(token : Text) : async Bool {
    if (caller.isAnonymous()) { return false };
    switch (Prim.envVar<system>("CAFFEINE_ADMIN_TOKEN")) {
      case (null) { Runtime.trap("CAFFEINE_ADMIN_TOKEN environment variable is not set") };
      case (?adminToken) {
        if (token == adminToken) {
          accessControlState.userRoles.add(caller, #admin);
          accessControlState.adminAssigned := true;
          return true;
        } else {
          return false;
        };
      };
    };
  };

  /// --- User Profile ---
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  /// --- Car model ---

  // Legacy type used only for migrating data from before the color field was added
  type CarModelLegacy = {
    id : CarModelId;
    name : Text;
    year : Nat;
    category : Text;
    available : Bool;
  };

  type CarModel = {
    id : CarModelId;
    name : Text;
    color : Text;
    category : Text;
    available : Bool;
  };

  module CarModel {
    public func compare(model1 : CarModel, model2 : CarModel) : Order.Order {
      Nat.compare(model1.id, model2.id);
    };
  };

  type CarModelInput = {
    name : Text;
    color : Text;
    category : Text;
    available : Bool;
  };

  // Legacy stable variable preserved so the upgrade can read old data
  stable var carModels : Map.Map<CarModelId, CarModelLegacy> = Map.empty();

  // New stable variable holding migrated car models with the color field
  let carModelsV2 = Map.empty<CarModelId, CarModel>();
  var nextCarModelId = 1;

  // Migrate any existing records from the legacy map on first upgrade
  system func postupgrade() {
    for ((id, old) in carModels.entries()) {
      let migrated : CarModel = {
        id = old.id;
        name = old.name;
        color = "";
        category = old.category;
        available = old.available;
      };
      carModelsV2.add(id, migrated);
      if (old.id >= nextCarModelId) {
        nextCarModelId := old.id + 1;
      };
    };
    // Clear legacy map after migration
    carModels := Map.empty();
  };

  /// -- Car model management --
  public shared ({ caller }) func addCarModel(input : CarModelInput) : async CarModelId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only Admins can add car models");
    };

    let id = nextCarModelId;
    nextCarModelId += 1;

    let carModel : CarModel = {
      id;
      name = input.name;
      color = input.color;
      category = input.category;
      available = input.available;
    };
    carModelsV2.add(id, carModel);
    id;
  };

  public shared ({ caller }) func deleteCarModel(carModelId : CarModelId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only Admins can delete car models");
    };
    if (not carModelsV2.containsKey(carModelId)) {
      Runtime.trap("Car model does not exist");
    };
    carModelsV2.remove(carModelId);
  };

  public shared ({ caller }) func toggleCarModelAvailability(carModelId : CarModelId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only Admins can update car model availability");
    };
    switch (carModelsV2.get(carModelId)) {
      case (null) { Runtime.trap("Car model does not exist") };
      case (?carModel) {
        let updatedCarModel = {
          carModel with
          available = not carModel.available;
        };
        carModelsV2.add(carModelId, updatedCarModel);
      };
    };
  };

  public query func listCarModels() : async [CarModel] {
    carModelsV2.values().toArray().sort();
  };

  /// --- Dealer location ---
  type DealerLocation = {
    id : DealerLocationId;
    name : Text;
    city : Text;
    address : Text;
    phone : Text;
  };

  type DealerLocationInput = {
    name : Text;
    city : Text;
    address : Text;
    phone : Text;
  };

  module DealerLocation {
    public func compare(location1 : DealerLocation, location2 : DealerLocation) : Order.Order {
      Nat.compare(location1.id, location2.id);
    };
  };

  let dealerLocations = Map.empty<DealerLocationId, DealerLocation>();
  var nextDealerLocationId = 1;

  /// -- Dealer location management --
  public shared ({ caller }) func addDealerLocation(input : DealerLocationInput) : async DealerLocationId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only Admins can add dealer locations");
    };

    let id = nextDealerLocationId;
    nextDealerLocationId += 1;

    let dealerLocation : DealerLocation = {
      id;
      name = input.name;
      city = input.city;
      address = input.address;
      phone = input.phone;
    };
    dealerLocations.add(id, dealerLocation);
    id;
  };

  public shared ({ caller }) func deleteDealerLocation(dealerLocationId : DealerLocationId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only Admins can delete dealer locations");
    };
    if (not dealerLocations.containsKey(dealerLocationId)) {
      Runtime.trap("Dealer location does not exist");
    };
    dealerLocations.remove(dealerLocationId);
  };

  public query func listDealerLocations() : async [DealerLocation] {
    dealerLocations.values().toArray().sort();
  };

  /// --- Test drive ---
  type TestDrive = {
    id : TestDriveId;
    carModelId : CarModelId;
    dealerLocationId : DealerLocationId;
    userId : Principal;
    customerName : Text;
    customerPhone : Text;
    scheduledDate : Text;
    status : {
      #scheduled;
      #inProgress;
      #completed;
      #cancelled;
    };
    notes : Text;
    createdAt : Int;
  };

  type TestDriveInput = {
    carModelId : CarModelId;
    dealerLocationId : DealerLocationId;
    customerName : Text;
    customerPhone : Text;
    scheduledDate : Text;
    notes : Text;
  };

  module TestDrive {
    public func compare(testDrive1 : TestDrive, testDrive2 : TestDrive) : Order.Order {
      Nat.compare(testDrive1.id, testDrive2.id);
    };
  };

  let testDrives = Map.empty<TestDriveId, TestDrive>();
  var nextTestDriveId = 1;

  /// -- Test drive management --
  public shared ({ caller }) func bookTestDrive(input : TestDriveInput) : async TestDriveId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can book test drives");
    };

    switch (carModelsV2.get(input.carModelId)) {
      case (null) { Runtime.trap("Car model does not exist") };
      case (?carModel) {
        if (not carModel.available) {
          Runtime.trap("Car model is not available for test drives");
        };
      };
    };

    if (not dealerLocations.containsKey(input.dealerLocationId)) {
      Runtime.trap("Dealer location does not exist");
    };

    let id = nextTestDriveId;
    nextTestDriveId += 1;

    let testDrive : TestDrive = {
      id;
      carModelId = input.carModelId;
      dealerLocationId = input.dealerLocationId;
      userId = caller;
      customerName = input.customerName;
      customerPhone = input.customerPhone;
      scheduledDate = input.scheduledDate;
      status = #scheduled;
      notes = input.notes;
      createdAt = Time.now();
    };

    testDrives.add(id, testDrive);
    id;
  };

  public shared ({ caller }) func cancelTestDrive(testDriveId : TestDriveId) : async () {
    switch (testDrives.get(testDriveId)) {
      case (null) { Runtime.trap("Test drive does not exist") };
      case (?testDrive) {
        if (testDrive.userId != caller and not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
          Runtime.trap("Unauthorized: Can only cancel your own test drive");
        };
        let cancelledTestDrive : TestDrive = {
          testDrive with status = #cancelled;
        };
        testDrives.add(testDriveId, cancelledTestDrive);
      };
    };
  };

  public shared ({ caller }) func updateTestDriveStatus(testDriveId : TestDriveId, newStatus : { #scheduled; #inProgress; #completed; #cancelled }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only Admins can update test drive status");
    };
    switch (testDrives.get(testDriveId)) {
      case (null) { Runtime.trap("Test drive does not exist") };
      case (?testDrive) {
        let updatedTestDrive : TestDrive = {
          testDrive with status = newStatus;
        };
        testDrives.add(testDriveId, updatedTestDrive);
      };
    };
  };

  public query ({ caller }) func listTestDrives() : async [TestDrive] {
    if (AccessControl.hasPermission(accessControlState, caller, #admin)) {
      return testDrives.values().toArray().sort();
    };
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list test drives");
    };
    testDrives.values().toArray().filter(
      func(testDrive) {
        testDrive.userId == caller;
      }
    );
  };

  /// --- Dashboard Stats ---
  public type DashboardStats = {
    total : Nat;
    scheduled : Nat;
    inProgress : Nat;
    completed : Nat;
    cancelled : Nat;
  };

  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    let relevantTestDrives = if (AccessControl.hasPermission(accessControlState, caller, #admin)) {
      testDrives.values().toArray();
    } else {
      if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
        Runtime.trap("Unauthorized: Only authenticated users can view dashboard stats");
      };
      testDrives.values().toArray().filter(
        func(testDrive) {
          testDrive.userId == caller;
        }
      );
    };

    var scheduled = 0;
    var inProgress = 0;
    var completed = 0;
    var cancelled = 0;

    for (testDrive in relevantTestDrives.vals()) {
      switch (testDrive.status) {
        case (#scheduled) { scheduled += 1 };
        case (#inProgress) { inProgress += 1 };
        case (#completed) { completed += 1 };
        case (#cancelled) { cancelled += 1 };
      };
    };

    {
      total = relevantTestDrives.size();
      scheduled;
      inProgress;
      completed;
      cancelled;
    };
  };
};
