import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getClassTypes } from "@/app/actions/class-types"
import { PricingManager } from "./components/PricingManager"

export default async function PricingPage() {
  const session = await auth()
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const classTypes = await getClassTypes()

  return (
    <div className="flex flex-col w-full bg-background min-h-screen pt-24 pb-24">
      <div className="container mx-auto px-6 md:px-12 max-w-4xl">
        <div className="mb-8">
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-heading mb-2">Class Pricing</h1>
          <p className="text-foreground/70 font-light">
            Manage class types and their default prices. Changes will apply to new events added to the calendar.
          </p>
        </div>

        <PricingManager initialClassTypes={classTypes} />
      </div>
    </div>
  )
}
