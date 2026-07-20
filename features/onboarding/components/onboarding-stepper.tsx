import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STEPS = [
  { id: 1, label: "Welcome" },
  { id: 2, label: "Business" },
  { id: 3, label: "Address" },
  { id: 4, label: "Invoicing" },
  { id: 5, label: "Done" },
] as const;

export function OnboardingStepper({
  currentStep,
  className,
}: {
  currentStep: number;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Step {currentStep} of {STEPS.length}
        </span>
        <span>{Math.round((currentStep / STEPS.length) * 100)}% complete</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
        />
      </div>
      <ol className="mt-4 hidden gap-2 sm:grid sm:grid-cols-5">
        {STEPS.map((step) => {
          const isComplete = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <li
              key={step.id}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-2 py-2 text-xs",
                isCurrent && "border-primary bg-primary/5 text-foreground",
                isComplete && "border-primary/30 text-foreground",
                !isCurrent && !isComplete && "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                  isComplete && "bg-primary text-primary-foreground",
                  isCurrent && "bg-primary text-primary-foreground",
                  !isCurrent && !isComplete && "bg-muted",
                )}
              >
                {isComplete ? <Check className="h-3 w-3" /> : step.id}
              </span>
              <span className="truncate font-medium">{step.label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
