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
  isActive: IisActive;
  isDeleted: boolean;
  isBlocked: boolean;
}
