/**
 * Profile completion gate (middleware + create-profile page)
 *
 * A profile is “complete” when all of the following are present and valid.
 * This matches the create-profile flow and the PUT /api/profile rules when
 * `username` is included (required fields for first-time onboarding).
 *
 * | Field           | Rule |
 * |-----------------|------|
 * | username        | Non-empty after trim (unique in DB, case-insensitive) |
 * | display_name    | Non-empty after trim |
 * | location        | Non-empty after trim |
 * | age             | Finite number > 0 |
 * | years_skating   | Finite number ≥ 0 |
 *
 * Incomplete users are redirected to `/create-profile` (except auth, API, etc.).
 * Users missing `username` (including legacy rows before username existed) are incomplete.
 */

export type ProfileCompletionRow = {
  username?: string | null
  display_name?: string | null
  location?: string | null
  age?: number | null
  years_skating?: number | null
} | null

export function isProfileComplete(profile: ProfileCompletionRow | undefined): boolean {
  if (!profile) return false

  const username = typeof profile.username === "string" ? profile.username.trim() : ""
  const displayName = typeof profile.display_name === "string" ? profile.display_name.trim() : ""
  const location = typeof profile.location === "string" ? profile.location.trim() : ""

  if (!username.length || !displayName.length || !location.length) return false

  const age = profile.age
  const yearsSkating = profile.years_skating

  if (typeof age !== "number" || !Number.isFinite(age) || age <= 0) return false
  if (typeof yearsSkating !== "number" || !Number.isFinite(yearsSkating) || yearsSkating < 0) {
    return false
  }

  return true
}
