import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { normalizeSkateSpotsForMap } from '@/lib/map-spots'
import { fetchApprovedSkateSpots } from '@/lib/queries/approved-spots'
import { submitSpotBodySchema } from '@/lib/schemas/submit-spot'

/** GET: approved spots only (same filter as the home page). POST: submit new spot as pending. */
export async function GET() {
  try {
    const supabase = await createClient()
    const { spots: raw, error } = await fetchApprovedSkateSpots(supabase)
    if (error) {
      console.error('GET /api/spots:', error.message)
      return NextResponse.json({ error: 'Failed to load spots' }, { status: 500 })
    }
    return NextResponse.json({ spots: normalizeSkateSpotsForMap(raw) })
  } catch (e) {
    console.error('GET /api/spots:', e)
    return NextResponse.json({ error: 'Failed to load spots' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let bodyJson: unknown
    try {
      bodyJson = await request.json()
    } catch {
      return NextResponse.json({ error: 'Request body must be JSON' }, { status: 400 })
    }

    const parsed = submitSpotBodySchema.safeParse(bodyJson)

    if (!parsed.success) {
      const first = parsed.error.issues[0]
      return NextResponse.json(
        {
          error: first?.message ?? 'Invalid data',
          details: parsed.error.issues.map((i) => ({
            path: i.path.join('.') || 'root',
            message: i.message,
          })),
        },
        { status: 400 }
      )
    }

    const d = parsed.data

    const { data, error } = await supabase
      .from('skate_spots')
      .insert({
        name: d.name,
        description: d.description,
        latitude: d.latitude,
        longitude: d.longitude,
        address: d.address,
        spot_type: d.spot_type,
        difficulty: d.difficulty,
        photo_url: d.photo_url,
        submitted_by: user.id,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error.message, error)
      return NextResponse.json(
        { error: 'Could not save spot. Check your data and try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ spot: data })
  } catch (error) {
    console.error('Submit spot error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
