"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { analytics } from "@/lib/analytics";

// Tracks page views on every App Router client-side navigation.
// Fires once on mount (initial page) then on every pathname change.
export default function AnalyticsPageTracker() {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    // Skip the very first render — GA4 init script already sent the first page_view
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    analytics.pageView(pathname, document.title);
  }, [pathname]);

  return null;
}
