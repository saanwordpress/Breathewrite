import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  return (
    <div className="flex flex-col w-full bg-background min-h-screen pt-24 items-center justify-center">
      <div className="container mx-auto px-6 max-w-md">
        <div className="bg-card border border-border p-8 rounded-3xl shadow-xl text-center">
          <h1 className="text-3xl font-heading mb-4">Welcome Back</h1>
          <p className="text-foreground/70 font-light mb-8">
            Sign in to manage your bookings and access your membership dashboard.
          </p>

          <form
            action={async (formData) => {
              "use server"
              await signIn("resend", formData)
            }}
            className="flex flex-col gap-4 mb-8"
          >
            <input 
              type="email" 
              name="email" 
              placeholder="Email address" 
              required 
              className="px-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent w-full font-light"
            />
            <Button type="submit" size="lg" className="rounded-full w-full py-6">
              Sign in with Email
            </Button>
          </form>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <form
              action={async () => {
                "use server"
                await signIn("credentials", { email: "admin@test.com", password: "admin", redirectTo: "/admin" })
              }}
            >
              <Button type="submit" variant="default" className="w-full rounded-full py-6 font-medium">
                Log in as Test Admin
              </Button>
            </form>

            <form
              action={async () => {
                "use server"
                await signIn("google")
              }}
            >
              <Button type="submit" variant="outline" className="w-full rounded-full bg-background hover:bg-muted py-6">
                Google
              </Button>
            </form>
            
            <form
              action={async () => {
                "use server"
                await signIn("apple")
              }}
            >
              <Button type="submit" variant="outline" className="w-full rounded-full bg-background hover:bg-muted py-6">
                Apple
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
