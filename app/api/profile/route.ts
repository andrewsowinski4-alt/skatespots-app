import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function readOptionalTrimmedString(
  body: Record<string, unknown>,
  key: string
): { ok: true; value: string | null | undefined } | { ok: false; error: string } {
  if (!Object.prototype.hasOwnProperty.call(body, key) || body[key] === undefined) {
    return { ok: true, value: undefined }
  }
  const v = body[key]
  if (v === null) return { ok: true, value: null }
  if (typeof v !== "string") {
    return { ok: false, error: `Invalid ${key}` }
  }
  return { ok: true, value: v.trim() }
}

function readOptionalFiniteNumber(
  body: Record<string, unknown>,
  key: string
): { ok: true; value: number | null | undefined } | { ok: false; error: string } {
  if (!Object.prototype.hasOwnProperty.call(body, key) || body[key] === undefined) {
    return { ok: true, value: undefined }
  }
  const v = body[key]
  if (v === null) return { ok: true, value: null }
  if (typeof v !== "number" || !Number.isFinite(v)) {
    return { ok: false, error: `Invalid ${key}` }
  }
  return { ok: true, value: v }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile: profile ?? null, user })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let bodyRaw: unknown
    try {
      bodyRaw = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    if (bodyRaw === null || typeof bodyRaw !== "object" || Array.isArray(bodyRaw)) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const body = bodyRaw as Record<string, unknown>

    const displayName = readOptionalTrimmedString(body, "display_name")
    if (!displayName.ok) {
      return NextResponse.json({ error: displayName.error }, { status: 400 })
    }
    const username = readOptionalTrimmedString(body, "username")
    if (!username.ok) {
      return NextResponse.json({ error: username.error }, { status: 400 })
    }
    const location = readOptionalTrimmedString(body, "location")
    if (!location.ok) {
      return NextResponse.json({ error: location.error }, { status: 400 })
    }
    const bio = readOptionalTrimmedString(body, "bio")
    if (!bio.ok) {
      return NextResponse.json({ error: bio.error }, { status: 400 })
    }
    const avatarUrl = readOptionalTrimmedString(body, "avatar_url")
    if (!avatarUrl.ok) {
      return NextResponse.json({ error: avatarUrl.error }, { status: 400 })
    }
    const yearsSkating = readOptionalFiniteNumber(body, "years_skating")
    if (!yearsSkating.ok) {
      return NextResponse.json({ error: yearsSkating.error }, { status: 400 })
    }
    const age = readOptionalFiniteNumber(body, "age")
    if (!age.ok) {
      return NextResponse.json({ error: age.error }, { status: 400 })
    }

    // Create-profile completion: requests that include username must send all required fields with valid values.
    if (Object.prototype.hasOwnProperty.call(body, "username")) {
      const missing: string[] = []
      if (
        username.value === undefined ||
        username.value === null ||
        (typeof username.value === "string" && !username.value.trim())
      ) {
        missing.push("username")
      }
      if (
        displayName.value === undefined ||
        displayName.value === null ||
        (typeof displayName.value === "string" && !displayName.value.trim())
      ) {
        missing.push("display_name")
      }
      if (
        location.value === undefined ||
        location.value === null ||
        (typeof location.value === "string" && !location.value.trim())
      ) {
        missing.push("location")
      }
      if (
        age.value === undefined ||
        age.value === null ||
        typeof age.value !== "number" ||
        !Number.isFinite(age.value) ||
        age.value <= 0
      ) {
        missing.push("age")
      }
      if (
        yearsSkating.value === undefined ||
        yearsSkating.value === null ||
        typeof yearsSkating.value !== "number" ||
        !Number.isFinite(yearsSkating.value) ||
        yearsSkating.value < 0
      ) {
        missing.push("years_skating")
      }
      if (missing.length > 0) {
        return NextResponse.json(
          {
            error: `Missing or invalid: ${[...new Set(missing)].join(", ")}`,
          },
          { status: 400 }
        )
      }
    }

    // Only include keys present in the request so partial updates (e.g. profile editor) do not null out omitted fields like username.
    const profileData: Record<string, unknown> = {
      id: user.id,
      updated_at: new Date().toISOString(),
    }
    const setIfPresent = (key: string, value: unknown) => {
      if (value !== undefined) profileData[key] = value
    }
    setIfPresent("username", username.value)
    setIfPresent("display_name", displayName.value)
    setIfPresent("location", location.value)
    setIfPresent("years_skating", yearsSkating.value)
    setIfPresent("age", age.value)
    setIfPresent("bio", bio.value)
    setIfPresent("avatar_url", avatarUrl.value)

    const { data, error } = await supabase
      .from("profiles")
      .upsert(profileData, { onConflict: "id" })
      .select()
      .single()

    if (error) {
      const e = error as {
        message?: string
        details?: string
        hint?: string
        code?: string | number
      }
      const codeStr = String(e.code ?? "")
      const combined = [e.message, e.details, e.hint].filter(Boolean).join(" ")
      // PostgREST: 23505 = unique_violation (e.g. profiles_username_lower_unique)
      const isUsernameTaken =
        codeStr === "23505" ||
        /profiles_username_lower_unique|profiles_username/i.test(combined) ||
        (/duplicate key|already exists/i.test(combined) &&
          /username|lower\(username\)/i.test(combined))

      if (isUsernameTaken) {
        return NextResponse.json(
          {
            error:
              "That username is already taken. Pick a different username and try again.",
          },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile: data })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
