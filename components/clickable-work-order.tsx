"use client";

import { useRouter } from "next/navigation";

interface ClickableWorkOrderProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function ClickableWorkOrder({
  id,
  children,
  className = "",
}: ClickableWorkOrderProps) {
  const router = useRouter();

  const navigate = () => {
    router.push(`/dashboard/work-orders/${id}`);
  };

  return (
    <div
      className={`cursor-pointer rounded-lg transition-colors hover:bg-muted/50 ${className}`}
      tabIndex={0}
      role="link"
      onClick={navigate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate();
        }
      }}
    >
      {children}
    </div>
  );
}