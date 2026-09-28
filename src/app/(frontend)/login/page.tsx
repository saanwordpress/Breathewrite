import Link from "next/link"
import { safeCallback } from "@/lib/url"
import { LoginForm } from "./AuthForms"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const adminMode = sp.as === "admin"
  const callbackUrl = adminMode ? "/admin" : safeCallback(sp.callbackUrl)

  return (
    <div className="flex flex-col w-full bg-background min-h-screen pt-24 items-center justify-center">
      <div className="container mx-auto px-6 max-w-md">
        <div className="bg-card border border-border p-8 rounded-3xl shadow-xl space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-heading mb-2">{adminMode ? "Admin Login" : "Member Login"}</h1>
            <p className="text-foreground/70 font-light text-sm">
              {adminMode
                ? "For Breathe Write staff."
                : "Log in to book classes free with your membership. Single classes can be booked without an account."}
            </p>
          </div>

          <LoginForm callbackUrl={callbackUrl} adminMode={adminMode} />

          {!adminMode && (
            <p className="text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-primary underline underline-offset-4">
                Create an account
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
