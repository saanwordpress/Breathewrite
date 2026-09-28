'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { logIn, signUp } from '@/app/actions/account'

const input = 'px-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent w-full font-light'

function ErrorText({ message }: { message?: string }) {
  if (!message) return null
  return <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive text-center">{message}</p>
}

export function LoginForm({ callbackUrl, adminMode }: { callbackUrl: string; adminMode: boolean }) {
  const [state, action, pending] = useActionState(logIn, null)
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <input name="username" placeholder={adminMode ? 'Username' : 'Email address'} autoComplete="username" required className={input} />
      <input type="password" name="password" placeholder="Password" autoComplete="current-password" required className={input} />
      <ErrorText message={state?.error} />
      <Button type="submit" size="lg" disabled={pending} className="rounded-full w-full py-6">
        {pending ? 'Logging in…' : 'Log In'}
      </Button>
    </form>
  )
}

export function SignupForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, action, pending] = useActionState(signUp, null)
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <input name="name" placeholder="Full name" autoComplete="name" required maxLength={100} className={input} />
      <input type="email" name="email" placeholder="Email address" autoComplete="email" required className={input} />
      <input type="password" name="password" placeholder="Password (at least 8 characters)" autoComplete="new-password" required minLength={8} className={input} />
      <input type="password" name="confirmPassword" placeholder="Confirm password" autoComplete="new-password" required minLength={8} className={input} />
      <ErrorText message={state?.error} />
      <Button type="submit" size="lg" disabled={pending} className="rounded-full w-full py-6">
        {pending ? 'Creating account…' : 'Create Account'}
      </Button>
    </form>
  )
}
