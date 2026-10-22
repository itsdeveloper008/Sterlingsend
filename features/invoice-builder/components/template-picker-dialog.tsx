"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TemplatesGallery } from "@/features/templates/components/templates-gallery";
import { INVOICE_TEMPLATE_COUNT } from "@/pdf/templates/catalog";

export function TemplatePickerDialog({
  open,
  onOpenChange,
  selectedId,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedId: string;
  onSelect: (templateId: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-5xl flex-col gap-4 overflow-hidden sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Choose a template</DialogTitle>
          <DialogDescription>
            {INVOICE_TEMPLATE_COUNT} templates from eight layouts. Pick a colour,
            then a layout. Applies to the PDF you download and print.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <TemplatesGallery
            mode="dialog"
            selectedId={selectedId}
            onSelect={(id) => {
              onSelect(id);
              onOpenChange(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
