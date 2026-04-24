import { z } from 'zod'

/**
 * Submit-spot body: must match `components/submit-spot-form.tsx` POST JSON
 * and columns written in `app/api/spots/route.ts` POST handler.
 */
export const submitSpotBodySchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters').max(100),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(1000),
  latitude: z
    .number({ invalid_type_error: 'Latitude must be a number' })
    .min(-90)
    .max(90),
  longitude: z
    .number({ invalid_type_error: 'Longitude must be a number' })
    .min(-180)
    .max(180),
  address: z.string().trim().min(5, 'Address must be at least 5 characters').max(200),
  spot_type: z.enum(['street', 'park', 'plaza', 'diy', 'other'], {
    errorMap: () => ({ message: 'Choose a spot type' }),
  }),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert'], {
    errorMap: () => ({ message: 'Choose a difficulty' }),
  }),
  photo_url: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? '' : v),
    z.string().min(1, 'Add a photo of the spot')
  ),
})

export type SubmitSpotBody = z.infer<typeof submitSpotBodySchema>
