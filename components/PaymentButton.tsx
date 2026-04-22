import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaymentButtonProps {
  className?: string;
  children?: string;
}

export function PaymentButton({ className, children = "Buy Access" }: PaymentButtonProps) {
  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

  if (!paymentLink) {
    return (
      <button className={cn(buttonVariants({ variant: "secondary", size: "lg" }), className)} disabled type="button">
        Set NEXT_PUBLIC_STRIPE_PAYMENT_LINK
      </button>
    );
  }

  return (
    <a
      className={cn(buttonVariants({ variant: "default", size: "lg" }), className)}
      href={paymentLink}
      rel="noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}
