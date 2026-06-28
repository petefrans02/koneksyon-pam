import crypto from "crypto";

const SECRET = process.env.CONTEST_SESSION_SECRET ?? "kp-contest-session-2026";

export interface SessionPayload {
  contestId: string;
  userId: string;
  startedAt: number; // ms timestamp
}

export function createSessionToken(contestId: string, userId: string): string {
  const payload: SessionPayload = { contestId, userId, startedAt: Date.now() };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [data, sig] = token.split(".");
    if (!data || !sig) return null;
    const expected = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
    if (expected !== sig) return null;
    return JSON.parse(Buffer.from(data, "base64url").toString()) as SessionPayload;
  } catch {
    return null;
  }
}
