import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    // Customers are strictly barred from admin routes and redirected to their dashboard/calendar
    redirect('/login?as=admin')
  }

  return <>{children}</>
}
