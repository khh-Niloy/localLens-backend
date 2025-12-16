export enum IisActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum Roles {
  TOURIST = "TOURIST",
  GUIDE = "GUIDE",
  ADMIN = "ADMIN",
}

export interface IUser {
  name: string;
  image?: string;
  email: string;
  phone?: string;
  address?: string;
  password: string;
  role: Roles;
  bio?: string;
  language?: string[];
  // Guide-specific fields
  expertise?: string[]; // e.g., History, Nightlife, Shopping
  dailyRate?: number; // How much they charge per day
  // Tourist-specific fields
  travelPreferences?: string[]; // Travel preferences
  isActive: IisActive;
  isDeleted: boolean;
  isBlocked: boolean;
}
