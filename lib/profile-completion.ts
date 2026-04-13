/**
 * Profile completion gate: authenticated users need a profile row with
 * non-empty username and display_name before using the app.
 */
export type ProfileCompletionRow = {
  username?: string | null
  display_name?: string | null
} | null

export function isProfileComplete(profile: ProfileCompletionRow | undefined): boolean {
  if (!profile) return false
  const username =
    typeof profile.username === "string" ? profile.username.trim() : ""
  const displayName =
    typeof profile.display_name === "string" ? profile.display_name.trim() : ""
  return username.length > 0 && displayName.length > 0
}
