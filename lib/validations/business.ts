import { z } from "zod";

export const bankDetailsSchema = z.object({
  accountName: z.string().max(120, "Account name is too long").optional().or(z.literal("")),
  accountNumber: z
    .string()
    .max(34, "Account number is too long")
    .optional()
    .or(z.literal("")),
  sortCode: z.string().max(20, "Sort code is too long").optional().or(z.literal("")),
  bankName: z.string().max(120, "Bank name is too long").optional().or(z.literal("")),
});

export type BankDetailsFormData = z.infer<typeof bankDetailsSchema>;

export function bankDetailsToFormData(
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    sortCode: string;
    bankName?: string;
  } | null,
): BankDetailsFormData {
  return {
    accountName: bankDetails?.accountName ?? "",
    accountNumber: bankDetails?.accountNumber ?? "",
    sortCode: bankDetails?.sortCode ?? "",
    bankName: bankDetails?.bankName ?? "",
  };
}

export function normalizeBankDetails(
  data: BankDetailsFormData,
):
  | { accountName: string; accountNumber: string; sortCode: string; bankName?: string }
  | undefined {
  const accountName = data.accountName?.trim() ?? "";
  const accountNumber = data.accountNumber?.trim() ?? "";
  const sortCode = data.sortCode?.trim() ?? "";
  const bankName = data.bankName?.trim() ?? "";

  if (!accountName && !accountNumber && !sortCode && !bankName) {
    return undefined;
  }

  return {
    accountName,
    accountNumber,
    sortCode,
    ...(bankName ? { bankName } : {}),
  };
}
