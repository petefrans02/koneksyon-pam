// Environment variable validation — runs at server startup.
// Catches misconfigured deployments before they cause silent failures.

const REQUIRED_SERVER = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

const OPTIONAL_SERVER = [
  "PAYPAL_CLIENT_ID",
  "PAYPAL_SECRET_KEY",
  "PAYPAL_WEBHOOK_ID",
  "GMAIL_USER",
  "GMAIL_APP_PASSWORD",
  "SMTP_HOST",
  "SMTP_PORT",
  "GA_MEASUREMENT_ID",
  "ADMIN_EMAILS",
] as const;

export function validateEnv(): void {
  if (typeof window !== "undefined") return; // client — skip
  const missing = REQUIRED_SERVER.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(
      `[KP] Missing required environment variables:\n${missing.map(k => `  • ${k}`).join("\n")}\nCheck your .env.local or Vercel dashboard.`
    );
  }
}

export function isPayPalConfigured(): boolean {
  return !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_SECRET_KEY);
}

export function isEmailConfigured(): boolean {
  return !!(process.env.GMAIL_APP_PASSWORD);
}

// Config object — safe to import anywhere server-side
export const cfg = {
  supabaseUrl:        process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey:    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  paypalClientId:     process.env.PAYPAL_CLIENT_ID,
  paypalSecret:       process.env.PAYPAL_SECRET_KEY,
  paypalWebhookId:    process.env.PAYPAL_WEBHOOK_ID,
  smtpUser:           process.env.GMAIL_USER ?? "contact@koneksyonpam.com",
  smtpPass:           process.env.GMAIL_APP_PASSWORD,
  smtpHost:           process.env.SMTP_HOST ?? "smtp.hostinger.com",
  smtpPort:           parseInt(process.env.SMTP_PORT ?? "465"),
  gaMeasurementId:    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  adminEmails:        (process.env.ADMIN_EMAILS ?? "contact@koneksyonpam.com")
                        .split(",").map(e => e.trim().toLowerCase()),
} as const;

// Type-safe unused-variable guard
void (OPTIONAL_SERVER satisfies readonly string[]);
