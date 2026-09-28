import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { PasswordForm } from "./PasswordForm"

export const dynamic = "force-dynamic"

export default async function AdminSettingsPage() {
  const session = await auth()
  const user = prisma && session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { username: true, mustChangePassword: true } })
    : null

  return (
    <div className="flex flex-col w-full bg-background min-h-screen pt-24 pb-24">
      <div className="container mx-auto px-6 md:px-12 max-w-2xl">
        <Button asChild variant="ghost" className="mb-4 -ml-4 text-muted-foreground hover:text-foreground">
          <Link href="/admin"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard</Link>
        </Button>
        <h1 className="text-4xl font-heading mb-2">Settings</h1>
        <p className="text-foreground/70 font-light mb-10">Change your admin login details.</p>

        {user?.mustChangePassword && (
          <p className="mb-6 rounded-2xl border border-accent bg-accent/10 p-4 text-sm">
            You&rsquo;re using a temporary password. Please choose your own now.
          </p>
        )}

        <div className="bg-card border border-border rounded-3xl p-8">
          <h2 className="text-2xl font-heading mb-6">Login Details</h2>
          <PasswordForm username={user?.username ?? ''} />
        </div>
      </div>
    </div>
  )
}
