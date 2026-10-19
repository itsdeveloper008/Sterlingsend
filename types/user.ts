import type { BaseDocument } from "./common";

export type UserAcquisition = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
};

export interface User extends BaseDocument {
  email: string;
  displayName?: string;
  businessId?: string;
  /** Set once at signup when analytics consent captured UTMs */
  acquisition?: UserAcquisition;
}

export type CreateUserInput = Pick<User, "email" | "displayName" | "acquisition"> & {
  id: string;
};

export type UpdateUserInput = Partial<
  Pick<User, "displayName" | "businessId">
>;
