'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { hashPassword, verifyPassword } from "@/lib/password"

export type SettingsResult = { ok: boolean; message: string }

export async function changeAdminPassword(_prev: SettingsResult | null, formData: FormData): Promise<SettingsResult> {
  const session = await auth()
  // @ts-expect-error custom session field
  if (!session?.user?.id || session.user.role !== 'ADMIN') return { ok: false, message: 'Please log in again.' }
  if (!prisma) return { ok: false, message: 'The database is not connected, so the password cannot be changed.' }

  const current = String(formData.get('currentPassword') ?? '')
  const next = String(formData.get('newPassword') ?? '')
  const confirm = String(formData.get('confirmPassword') ?? '')
  const username = String(formData.get('username') ?? '').trim().toLowerCase()

  if (next.length < 10) return { ok: false, message: 'The new password must be at least 10 characters.' }
  if (next !== confirm) return { ok: false, message: 'The new passwords do not match.' }
  if (username && !/^[a-z0-9._-]{3,40}$/.test(username)) {
    return { ok: false, message: 'Username can use 3–40 letters, numbers, dots, dashes or underscores.' }
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user?.passwordHash || !(await verifyPassword(current, user.passwordHash))) {
    return { ok: false, message: 'Your current password is incorrect.' }
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(next),
        mustChangePassword: false,
        ...(username && username !== user.username ? { username } : {}),
      },
    })
  } catch {
    return { ok: false, message: 'That username is already taken.' }
  }
  return { ok: true, message: 'Saved. Use your new details next time you log in.' }
}
