'use server'

import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import { signIn } from "@/auth"
import { createAccount } from "@/lib/store"
import { hashPassword } from "@/lib/password"
import { safeCallback } from "@/lib/url"

export type FormResult = { error: string } | null

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/


export async function logIn(_prev: FormResult, formData: FormData): Promise<FormResult> {
  try {
    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirectTo: safeCallback(formData.get("callbackUrl")),
    })
  } catch (error) {
    if (error instanceof AuthError) return { error: "Incorrect email/username or password." }
    throw error
  }
  return null
}

export async function signUp(_prev: FormResult, formData: FormData): Promise<FormResult> {
  const name = String(formData.get("name") ?? "").trim().slice(0, 100)
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")
  const confirm = String(formData.get("confirmPassword") ?? "")

  if (!name) return { error: "Please enter your name." }
  if (!EMAIL_RE.test(email) || email.length > 254) return { error: "Please enter a valid email address." }
  if (password.length < 8) return { error: "Your password must be at least 8 characters." }
  if (password !== confirm) return { error: "The passwords do not match." }

  const result = await createAccount(email, name, await hashPassword(password))
  if ("error" in result) return result

  await signIn("credentials", { username: email, password, redirectTo: safeCallback(formData.get("callbackUrl")) })
  redirect("/dashboard")
}
