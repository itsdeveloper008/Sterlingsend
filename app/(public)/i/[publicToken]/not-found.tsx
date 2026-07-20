export default function PublicInvoiceNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Invoice not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This link may be invalid or the invoice is no longer available.
      </p>
    </div>
  );
}
