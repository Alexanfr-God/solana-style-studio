
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPickerBase } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// Define proper props type
interface CustomNavigationProps extends React.HTMLAttributes<HTMLDivElement> {
  goToMonth: (month: Date) => void;
  nextMonth: Date | undefined;
  previousMonth: Date | undefined;
}

export function CustomNavigation({
  goToMonth,
  nextMonth,
  previousMonth,
  ...props
}: CustomNavigationProps) {
  return (
    <div className="space-x-1 flex items-center" {...props}>
      <button
        onClick={() => previousMonth && goToMonth(previousMonth)}
        disabled={!previousMonth}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous month</span>
      </button>
      <button
        onClick={() => nextMonth && goToMonth(nextMonth)}
        disabled={!nextMonth}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
        )}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next month</span>
      </button>
    </div>
  );
}
