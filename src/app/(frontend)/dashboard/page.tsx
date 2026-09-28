import { redirect } from "next/navigation"

// Customers no longer have accounts; bookings are confirmed by email.
export default function DashboardPage() {
  redirect("/admin")
}
