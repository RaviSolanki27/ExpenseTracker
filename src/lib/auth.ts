import crypto from "crypto";

const SALT = "duoledger_pin_salt_2026";

export function hashPasscode(passcode: string): string {
  return crypto
    .createHash("sha256")
    .update(passcode + SALT)
    .digest("hex");
}

export function verifyPasscode(input: string, stored: string): boolean {
  if (!stored) return input === "0000";
  if (stored === input) return true;
  return hashPasscode(input) === stored;
}

