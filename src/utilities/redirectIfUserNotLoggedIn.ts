import { redirect } from 'next/navigation'
import { User } from '@/payload-types'

export const redirectIfUserNotLoggedIn = (
  user: User | null,
  warningMessage = 'Please login to access this page.'
) => {
  if (!user) {
    redirect(`/login?warning=${encodeURIComponent(warningMessage)}`)
  }
}
