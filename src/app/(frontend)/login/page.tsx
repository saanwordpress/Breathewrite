import { signIn, googleSignInEnabled, emailSignInEnabled } from "@/auth"
import { Button } from "@/components/ui/button"

function safeCallback(value: string | string[] | undefined): string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard"
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const redirectTo = safeCallback(sp.callbackUrl)
  const isDev = process.env.NODE_ENV !== "production"
  const noProviders = !googleSignInEnabled && !emailSignInEnabled && !isDev

  return (
    <div className="flex flex-col w-full bg-background min-h-screen pt-24 items-center justify-center">
      <div className="container mx-auto px-6 max-w-md">
        <div className="bg-card border border-border p-8 rounded-3xl shadow-xl text-center">
          <h1 className="text-3xl font-heading mb-4">Welcome</h1>
          <p className="text-foreground/70 font-light mb-8">
            Sign in to book classes, manage your membership and find your session links.
          </p>

          {sp.error && (
            <p className="mb-6 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              Sign-in didn&rsquo;t work. Please try again.
            </p>
          )}

          {noProviders && (
            <p className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
              Online sign-in is being set up. Please check back shortly.
            </p>
          )}

          {googleSignInEnabled && (
            <form
              action={async () => {
                "use server"
                await signIn("google", { redirectTo })
              }}
              className="mb-6"
            >
              <Button type="submit" variant="outline" className="w-full rounded-full bg-background hover:bg-muted py-6">
                Continue with Google
              </Button>
            </form>
          )}

          {googleSignInEnabled && emailSignInEnabled && (
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or use your email</span>
              </div>
            </div>
          )}

          {emailSignInEnabled && (
            <form
              action={async (formData) => {
                "use server"
                await signIn("resend", { email: formData.get("email"), redirectTo })
              }}
              className="flex flex-col gap-4"
            >
              <input
                type="email"
                name="email"
                placeholder="Email address"
                required
                className="px-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent w-full font-light"
              />
              <Button type="submit" size="lg" className="rounded-full w-full py-6">
                Email me a sign-in link
              </Button>
            </form>
          )}

          {isDev && (
            <form
              action={async () => {
                "use server"
                await signIn("credentials", { email: "admin@test.com", password: "admin", redirectTo: "/admin" })
              }}
              className="mt-8"
            >
              <Button type="submit" variant="ghost" className="w-full rounded-full text-muted-foreground">
                Log in as Test Admin (development only)
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
