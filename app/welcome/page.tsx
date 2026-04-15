import { redirect } from 'next/navigation'

/** Legacy route: onboarding lives at /create-profile. */
export default function WelcomePage() {
  redirect('/create-profile')
}
