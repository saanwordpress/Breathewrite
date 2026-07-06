import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Search, MoreHorizontal } from 'lucide-react'

const DUMMY_MEMBERS = [
  { id: '1', name: 'Jane Doe', email: 'jane@example.com', status: 'ACTIVE', joinDate: 'Jan 12, 2026', plan: 'Monthly' },
  { id: '2', name: 'John Smith', email: 'john@example.com', status: 'ACTIVE', joinDate: 'Feb 05, 2026', plan: 'Annual' },
  { id: '3', name: 'Sarah Connor', email: 'sarah@example.com', status: 'INACTIVE', joinDate: 'Mar 10, 2026', plan: 'None' },
  { id: '4', name: 'Michael Scott', email: 'michael@example.com', status: 'ACTIVE', joinDate: 'Apr 22, 2026', plan: 'Monthly' },
  { id: '5', name: 'Dwight Schrute', email: 'dwight@example.com', status: 'ACTIVE', joinDate: 'May 01, 2026', plan: 'Annual' },
]

export default async function ManageMembersPage() {
  const session = await auth()

  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="flex flex-col w-full bg-background min-h-screen pt-24 pb-24">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4 -ml-4 text-muted-foreground hover:text-foreground">
            <Link href="/admin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-4xl font-heading mb-2">Manage Members</h1>
              <p className="text-foreground/70 font-light">
                View and manage all registered members and customers.
              </p>
            </div>
            <Button className="rounded-full">Export CSV</Button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search members..." 
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-full text-sm font-light focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-light">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Plan</th>
                  <th className="px-6 py-4 font-medium">Join Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {DUMMY_MEMBERS.map((member) => (
                  <tr key={member.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        member.status === 'ACTIVE' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{member.plan}</td>
                    <td className="px-6 py-4 text-muted-foreground">{member.joinDate}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
