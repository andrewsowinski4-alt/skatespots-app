import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const spotSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().min(5).max(200),
  spot_type: z.enum(['street', 'park', 'plaza', 'diy', 'other']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  photo_url: z.string().nullable(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const result = spotSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid data', details: result.error.issues }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('skate_spots')
      .insert({
        ...result.data,
        submitted_by: user.id,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create spot' }, { status: 500 })
    }

    return NextResponse.json({ spot: data })
  } catch (error) {
    console.error('Submit spot error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
