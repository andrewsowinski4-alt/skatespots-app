# Profile completion

## Rule (authoritative)

The app treats a profile as **complete** when **all** of the following hold:

| Field | Requirement |
|--------|----------------|
| `username` | Non-empty after trim; must be unique (case-insensitive) in the database |
| `display_name` | Non-empty after trim |
| `location` | Non-empty after trim |
| `age` | Number &gt; 0 |
| `years_skating` | Number ≥ 0 |

Implementation: `isProfileComplete()` in `lib/profile-completion.ts`.

## Enforcement

- **Middleware** (`lib/supabase/middleware.ts`): Signed-in users with an incomplete profile are redirected to `/create-profile` (with standard path exclusions for `/auth`, `/api`, etc.). The legacy `/welcome` URL redirects to `/create-profile`.
- **Create profile page** (`app/create-profile/page.tsx`): If the profile is already complete, redirects to `/`.
- **API** (`app/api/profile/route.ts` `PUT`): If the body includes `username`, all required onboarding fields are validated before upsert. Duplicate username returns **409** with a clear message.

## Legacy / edge cases

- **No profile row** or **NULL / empty `username`**: Incomplete → onboarding.
- **Old accounts** missing `username` or any required field: Incomplete → `/create-profile` until all fields are saved.

## Manual QA checklist

- [ ] Duplicate username: submit create-profile with a taken handle → clear error (toast), no redirect home.
- [ ] Old / partial profile: missing username or required fields → user lands on `/create-profile` and can finish.
- [ ] Completed profile: user reaches `/` and other app routes without onboarding redirect.
- [ ] Incomplete profile: middleware still sends user to `/create-profile`.
