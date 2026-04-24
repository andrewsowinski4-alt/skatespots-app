export type { SubmitSpotBody } from '@/lib/schemas/submit-spot'

export type SpotStatus = 'pending' | 'approved' | 'rejected'

export interface SkateSpot {
  id: string
  name: string
  description: string
  latitude: number
  longitude: number
  address: string
  spot_type: string
  difficulty: string
  photo_url?: string | null
  photo_urls?: string[]
  status: SpotStatus
  submitted_by: string | null
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  email: string
  created_at: string
}
