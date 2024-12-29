export enum Amenity {
    CATEGORY_FAVORITE = "FAVORITE",
    CATEGORY_STANDOUT = "STANDOUT",
    CATEGORY_SAFETY = "SAFETY",
}

export enum Discount {
    NEW_USER = "NEW_USER",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
}
export enum RoomStatus {
    CREATING = "Creating",                 // The room is being created, not yet complete
    PENDING_APPROVAL = "Pending Approval",  // The room is awaiting approval from management
    APPROVED = "Approved",                  // The room has been approved and is ready for use
    AVAILABLE = "Available",                // The room is vacant and available for rent
    BOOKED = "Booked",                      // The room has been reserved but the tenant hasn't moved in yet
    OCCUPIED = "Occupied",                  // The room is currently occupied by a tenant
    UNDER_MAINTENANCE = "Under Maintenance",// The room is under maintenance and not available for rent
    CLEANING = "Cleaning",                  // The room is being cleaned and temporarily unavailable for rent
    RESERVED = "Reserved",                  // The room has been held but not officially booked
    OUT_OF_SERVICE = "Out of Service",      // The room is out of service due to long-term repairs
    FAILED = "Failed"                       // The room encountered an error during creation or approval
}

export enum PrivacyType {
    ENTIRE = "ENTIRE", // Entire House
    ROOM = "ROOM", // Room
    SHARED = "SHARED", // Shared Room
}