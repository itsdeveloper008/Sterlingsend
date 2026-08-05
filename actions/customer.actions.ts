"use server";

import { revalidatePath } from "next/cache";
import { requireOnboarding } from "@/actions/auth.actions";
import {
  customerFormSchema,
  type CustomerFormData,
} from "@/lib/validations/customer";
import { customerService } from "@/services/customer.service";
import { routes } from "@/config/routes";
import {
  serializeCustomer,
  serializeCustomers,
} from "@/features/customers/lib/serialize";
import type { SerializedCustomer } from "@/features/customers/lib/format";

export type CustomerActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

async function getBusinessId() {
  const { business } = await requireOnboarding();
  return business.id;
}

function revalidateCustomerPaths(customerId?: string) {
  revalidatePath(routes.customers);
  if (customerId) {
    revalidatePath(routes.customer(customerId));
    revalidatePath(`${routes.customer(customerId)}/edit`);
  }
}

export async function getCustomersAction(options?: {
  cursor?: string | null;
  limit?: number;
}): Promise<
  CustomerActionResult<{
    customers: SerializedCustomer[];
    nextCursor: string | null;
    hasMore: boolean;
  }>
> {
  try {
    const businessId = await getBusinessId();
    const result = await customerService.getCustomers({
      businessId,
      cursor: options?.cursor,
      limit: options?.limit,
    });
    return {
      success: true,
      data: {
        customers: serializeCustomers(result.customers),
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
      },
    };
  } catch (error) {
    console.error("[getCustomersAction]", error);
    return { success: false, error: "Failed to load customers" };
  }
}

export async function searchCustomersAction(
  searchTerm: string,
): Promise<CustomerActionResult<SerializedCustomer[]>> {
  try {
    const businessId = await getBusinessId();
    const customers = await customerService.searchCustomers(
      businessId,
      searchTerm,
    );
    return { success: true, data: serializeCustomers(customers) };
  } catch (error) {
    console.error("[searchCustomersAction]", error);
    return { success: false, error: "Failed to search customers" };
  }
}

export async function getCustomerAction(
  customerId: string,
): Promise<CustomerActionResult<SerializedCustomer>> {
  try {
    const businessId = await getBusinessId();
    const customer = await customerService.getCustomer(customerId, businessId);
    if (!customer) {
      return { success: false, error: "Customer not found" };
    }
    return { success: true, data: serializeCustomer(customer) };
  } catch (error) {
    console.error("[getCustomerAction]", error);
    return { success: false, error: "Failed to load customer" };
  }
}

export async function createCustomerAction(
  data: CustomerFormData,
): Promise<CustomerActionResult<SerializedCustomer>> {
  const parsed = customerFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const businessId = await getBusinessId();
    const customer = await customerService.createCustomer({
      businessId,
      ...parsed.data,
    });
    revalidateCustomerPaths(customer.id);
    return { success: true, data: serializeCustomer(customer) };
  } catch (error) {
    console.error("[createCustomerAction]", error);
    return { success: false, error: "Failed to create customer" };
  }
}

export async function updateCustomerAction(
  customerId: string,
  data: CustomerFormData,
): Promise<CustomerActionResult<SerializedCustomer>> {
  const parsed = customerFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const businessId = await getBusinessId();
    await customerService.updateCustomer(customerId, businessId, parsed.data);
    const customer = await customerService.getCustomer(customerId, businessId);
    if (!customer) {
      return { success: false, error: "Customer not found after update" };
    }
    revalidateCustomerPaths(customerId);
    return { success: true, data: serializeCustomer(customer) };
  } catch (error) {
    console.error("[updateCustomerAction]", error);
    return { success: false, error: "Failed to update customer" };
  }
}

export async function deleteCustomerAction(
  customerId: string,
): Promise<CustomerActionResult> {
  try {
    const businessId = await getBusinessId();
    await customerService.deleteCustomer(customerId, businessId);
    revalidateCustomerPaths(customerId);
    return { success: true };
  } catch (error) {
    console.error("[deleteCustomerAction]", error);
    return { success: false, error: "Failed to delete customer" };
  }
}
