// Google Analytics 4 — loads only in production when GA_MEASUREMENT_ID is set.
// Page-view tracking on client-side navigation is handled by AnalyticsPageTracker.

import Script from "next/script";
import AnalyticsPageTracker from "./AnalyticsPageTracker";

const GA_ID   = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const IS_PROD = process.env.NODE_ENV === "production";

export default function Analytics() {
  if (!GA_ID || !IS_PROD) return null;

  return (
    <>
      {/* GA4 loader */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      {/* GA4 config — send_page_view:false because AnalyticsPageTracker handles it */}
      <Script id="ga4-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_ID}', {
          send_page_view: true,
          anonymize_ip: true,
          cookie_flags: 'SameSite=None;Secure'
        });
      `}</Script>
      {/* Client-side route change tracker */}
      <AnalyticsPageTracker />
    </>
  );
}
