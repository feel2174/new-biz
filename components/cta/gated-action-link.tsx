"use client";

import { PaidOnly, useTrafficGate } from "@/components/traffic/traffic-gate";
import { cn } from "@/lib/utils";

export function GatedActionLink({
  href,
  label,
  description,
  buttonName,
  className,
}: {
  href: string;
  label: string;
  description?: string;
  buttonName: string;
  className?: string;
}) {
  const { naverAdParams } = useTrafficGate();

  return (
    <PaidOnly>
      <a
        href={href}
        rel="noopener noreferrer sponsored"
        className={cn(
          "block rounded-xl px-5 py-4 text-center text-base font-bold text-white no-underline",
          className
        )}
        style={{
          backgroundColor: "#dc2626",
          animation: "pulse-cta 2s infinite",
        }}
        onClick={() => {
          // @ts-expect-error - gtag는 app/layout.tsx head 스크립트가 주입하는 전역
          window.gtag?.("event", "cta_click", {
            button_name: buttonName,
            link_url: href,
            ...naverAdParams,
          });
        }}
      >
        <span className="block">{label}</span>
        {description && (
          <span className="mt-1 block text-sm font-medium text-white/85">
            {description}
          </span>
        )}
      </a>
    </PaidOnly>
  );
}
