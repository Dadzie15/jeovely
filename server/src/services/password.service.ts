import { hash, verify } from "@node-rs/argon2"

import { PASSWORD_HASH_OPTIONS } from "../config/auth.js"

/** Argon2id (the library default algorithm) with OWASP-recommended cost. */
export function hashPassword(password: string): Promise<string> {
  return hash(password, PASSWORD_HASH_OPTIONS)
}

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password)
  } catch {
    // A malformed stored hash is treated as a failed match, never as an error leak.
    return false
  }
}

let dummyHash: Promise<string> | undefined

/**
 * Runs a real verification against a throwaway hash so a sign-in for an
 * unknown email takes about as long as one for a known email (no timing oracle).
 */
export async function verifyAgainstDummy(password: string): Promise<void> {
  dummyHash ??= hashPassword("jeovely-timing-equaliser-not-a-real-password")
  await verifyPassword(await dummyHash, password)
}
