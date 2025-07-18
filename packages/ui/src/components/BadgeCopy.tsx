import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const badgeCopyVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeCopyProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeCopyVariants> {
  timeout?: number;
}

function BadgeCopy({
  className,
  variant,
  children,
  timeout = 2000,
  ...props
}: BadgeCopyProps) {
  const [displayText, setDisplayText] = useState<React.ReactNode>(children);
  const [originalText] = useState<React.ReactNode>(children);

  const handleClick = () => {
    // Copy text to clipboard
    if (typeof children === "string") {
      navigator.clipboard
        .writeText(children)
        .then(() => {
          // Show "Copied!" message
          setDisplayText("Copied!");

          // Reset back to original text after timeout
          setTimeout(() => {
            setDisplayText(originalText);
          }, timeout);
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    }
  };

  return (
    <div
      className={cn(badgeCopyVariants({ variant }), className)}
      onClick={handleClick}
      {...props}
    >
      {displayText}
    </div>
  );
}

export { BadgeCopy, badgeCopyVariants };
