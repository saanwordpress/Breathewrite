import { Loader2 } from "lucide-react"

export default function AdminLoading() {
  return (
    <div className="flex w-full min-h-screen items-center justify-center bg-background pt-24">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="font-light">Loading…</span>
      </div>
    </div>
  )
}
