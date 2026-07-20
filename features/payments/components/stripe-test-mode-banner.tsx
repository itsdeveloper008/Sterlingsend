import { Badge } from "@/components/ui/badge";

export function StripeTestModeBanner({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 ${className ?? ""}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className="border-amber-300 bg-amber-100 text-amber-900"
        >
          Test mode
        </Badge>
        <span>
          Payments use Stripe test keys. No real charges are processed.
        </span>
      </div>
    </div>
  );
}
