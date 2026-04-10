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

    const profileData = {
      id: user.id,
      display_name: displayName.value,
      location: location.value,
      years_skating: yearsSkating.value,
      age: age.value,
      bio: bio.value,
      avatar_url: avatarUrl.value,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from("profiles")
      .upsert(profileData, { onConflict: "id" })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile: data })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
