import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams

  return (
    <div className="flex flex-col w-full bg-background min-h-screen pt-24 items-center justify-center">
      <div className="container mx-auto px-6 max-w-md">
        <div className="bg-card border border-border p-8 rounded-3xl shadow-xl">
          <h1 className="text-3xl font-heading mb-2 text-center">Admin Login</h1>
          <p className="text-foreground/70 font-light mb-8 text-center text-sm">
            For Breathe Write staff. To book a class, go to the calendar &mdash; no account needed.
          </p>

          {sp.error && (
            <p className="mb-6 rounded-xl bg-destructive/10 p-3 text-sm text-destructive text-center">
              Incorrect username or password.
            </p>
          )}

          <form
            action={async (formData) => {
              "use server"
              try {
                await signIn("credentials", {
                  username: formData.get("username"),
                  password: formData.get("password"),
                  redirectTo: "/admin",
                })
              } catch (error) {
                if (error instanceof AuthError) redirect("/login?error=1")
                throw error
              }
            }}
            className="flex flex-col gap-4"
          >
            <input
              name="username"
              placeholder="Username"
              autoComplete="username"
              required
              className="px-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent w-full font-light"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="current-password"
              required
              className="px-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent w-full font-light"
            />
            <Button type="submit" size="lg" className="rounded-full w-full py-6">
              Log In
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
