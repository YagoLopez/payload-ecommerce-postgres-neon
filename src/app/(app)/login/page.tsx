import type { Metadata } from 'next'

import { RenderParams } from '@/components/RenderParams'
import Link from 'next/link'
import React from 'react'

import { LoginForm } from '@/components/forms/LoginForm'
import { redirect } from 'next/navigation'
import { UsersRepository } from '@/repositories/UsersRepository'

const styles = {
  background: 'aliceblue',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'navy',
  borderRadius: '5px',
  padding: '10px',
  marginBottom: '10px',
  boxShadow: '0 10px 8px rgba(0, 0, 0, 0.1)',
}

export default async function Login() {
const user = await UsersRepository.getCurrentUser()

  if (user) {
    redirect(`/account?warning=${encodeURIComponent('You are already logged in.')}`)
  }

  return (
    <div className="container">
      <div className="max-w-xl mx-auto my-12">
        <RenderParams />

        <h1 className="mb-6 text-[1.8rem]">Log in</h1>
        <p className="mb-2">
          This is where the customers can login to the Ecommerce Store.

        </p>
        <p className="mb-2">
          To access the admin dashboard, please
          <Link className="underline hover:underline-offset-4 text-blue-900" href="/admin/collections/users"> login here</Link>.

        </p>
        <div className="mb-10">
          <div style={styles}>
            <p style={{ color: 'navy', fontWeight: 'bold' }}>You can login as a guest using the following
              credentials:</p>
            <p>➡️ <b>Email:</b> readonly@readonly.com</p>
            <p>➡️ <b>Password:</b> readonly</p>
          </div>

        </div>

        <LoginForm />
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Login or create an account to get started.',
  openGraph: {
    title: 'Login',
    url: '/login',
  },
  title: 'Login',
}
