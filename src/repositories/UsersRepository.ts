import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const payload = await getPayload({ config: configPromise })

export class UsersRepository {
  static async getCurrentUser() {
    const headers = await getHeaders()
    const { user } = await payload.auth({ headers })
    return user
  }
}
