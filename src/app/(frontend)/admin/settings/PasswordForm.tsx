'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { changeAdminPassword } from '@/app/actions/admin-settings'

const input = 'px-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent w-full font-light'

export function PasswordForm({ username }: { username: string }) {
  const [state, action, pending] = useActionState(changeAdminPassword, null)

  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm font-medium">
        Username
        <input name="username" defaultValue={username} autoComplete="username" className={`${input} mt-2`} />
      </label>
      <label className="block text-sm font-medium">
        Current password
        <input type="password" name="currentPassword" required autoComplete="current-password" className={`${input} mt-2`} />
      </label>
      <label className="block text-sm font-medium">
        New password <span className="font-light text-muted-foreground">(at least 10 characters)</span>
        <input type="password" name="newPassword" required minLength={10} autoComplete="new-password" className={`${input} mt-2`} />
      </label>
      <label className="block text-sm font-medium">
        Confirm new password
        <input type="password" name="confirmPassword" required minLength={10} autoComplete="new-password" className={`${input} mt-2`} />
      </label>

      {state && (
        <p className={`rounded-xl p-3 text-sm ${state.ok ? 'bg-[#5B8260]/10 text-[#3d5a41]' : 'bg-destructive/10 text-destructive'}`}>
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending} className="rounded-full px-8">
        {pending ? 'Saving…' : 'Save Changes'}
      </Button>
    </form>
  )
}
