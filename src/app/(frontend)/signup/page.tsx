import Link from "next/link"
import { safeCallback } from "@/lib/url"
import { SignupForm } from "../login/AuthForms"

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const callbackUrl = safeCallback(sp.callbackUrl)

  return (
    <div className="flex flex-col w-full bg-background min-h-screen pt-24 items-center justify-center">
      <div className="container mx-auto px-6 max-w-md">
        <div className="bg-card border border-border p-8 rounded-3xl shadow-xl space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-heading mb-2">Create Your Account</h1>
            <p className="text-foreground/70 font-light text-sm">
              An account is needed for membership, so you can book any class free while it&rsquo;s active.
            </p>
          </div>

          <SignupForm callbackUrl={callbackUrl} />

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-primary underline underline-offset-4">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
