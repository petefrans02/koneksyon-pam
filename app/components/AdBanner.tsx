"use client";

import { useEffect, useRef, useState } from "react";

// Replace with your AdSense Publisher ID when approved:
// e.g. "ca-pub-XXXXXXXXXXXXXXXX"
const PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "";

export type AdSlot = {
  /** AdSense ad-slot ID from your AdSense dashboard */
  slotId: string;
  /** Visual format */
  format?: "auto" | "rectangle" | "vertical" | "horizontal";
  /** Whether the ad should be responsive */
  responsive?: boolean;
  /** Optional min-height to reserve space and prevent CLS */
  minHeight?: number;
  /** className for the outer wrapper */
  className?: string;
};

/**
 * Lazy-loaded AdSense banner.
 * - Uses IntersectionObserver → only initialises the ad when it enters the viewport.
 * - Reserves min-height to prevent Cumulative Layout Shift (CLS).
 * - Renders nothing if PUBLISHER_ID is not configured or if `disabled` is true
 *   (pass disabled={true} during contests / quiz sessions).
 */
export default function AdBanner({
  slotId,
  format = "auto",
  responsive = true,
  minHeight = 90,
  className = "",
  disabled = false,
}: AdSlot & { disabled?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const pushed = useRef(false);

  // Observe when the container enters the viewport
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { rootMargin: "200px" }
    );
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Push the ad unit once it becomes visible
  useEffect(() => {
    if (!visible || pushed.current || !PUBLISHER_ID || disabled) return;
    pushed.current = true;
    try {
      // @ts-expect-error adsbygoogle is injected by the script tag
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded yet — no-op
    }
  }, [visible, disabled]);

  // Don't render if publisher ID missing, disabled, or during a contest
  if (!PUBLISHER_ID || disabled) return null;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        minHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        contain: "layout",
      }}
    >
      {visible && (
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%", minHeight }}
          data-ad-client={PUBLISHER_ID}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive={responsive ? "true" : "false"}
        />
      )}
    </div>
  );
}
