"use client";

import { useRouter } from "next/navigation";

interface ClickableWorkOrderProps {
  id: string;
  children: React.ReactNode;
}

export function ClickableWorkOrder({ id, children }: ClickableWorkOrderProps) {
  const router = useRouter();

  const navigate = () => {
    router.push(`/dashboard/work-orders/${id}`);
  };

  return (
    <div
      className="cursor-pointer rounded-lg p-3 transition-colors hover:bg-muted/50"
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
