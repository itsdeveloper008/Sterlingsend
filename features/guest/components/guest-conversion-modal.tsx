"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { routes } from "@/config/routes";
import { saveGuestOnboardingSeed } from "@/features/guest/lib/storage";
import { trackGuestEvent } from "@/features/guest/lib/analytics";
import type { GuestInvoice } from "@/features/guest/types";

export function GuestConversionModal({
  open,
  onOpenChange,
  invoice,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: GuestInvoice;
}) {
  function handleCreateAccount() {
    saveGuestOnboardingSeed(invoice);
    trackGuestEvent("guest_account_conversion_clicked");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save your invoices forever</DialogTitle>
          <DialogDescription>
            Create a free SterlingSend account to keep invoices, customers, and payment
            history in one place.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <ButtonLink
            href={`${routes.signup}?from=guest`}
            className="w-full"
            onClick={handleCreateAccount}
          >
            Create free account
          </ButtonLink>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
