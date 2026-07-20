import type { BaseDocument } from "./common";

export interface User extends BaseDocument {
  email: string;
  displayName?: string;
  businessId?: string;
}

export type CreateUserInput = Pick<User, "email" | "displayName"> & {
  id: string;
};

export type UpdateUserInput = Partial<
  Pick<User, "displayName" | "businessId">
>;
