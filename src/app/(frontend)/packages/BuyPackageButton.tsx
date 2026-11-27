'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { buyPackage } from '@/app/actions/packages'

export function BuyPackageButton({ slug, label, highlight }: { slug: string; label: string; highlight?: boolean }) {
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  return (
    <div className="space-y-2">
      <Button
        type="button"
        disabled={pending}
        variant={highlight ? 'default' : 'outline'}
        className="w-full rounded-full py-5"
        onClick={() =>
          start(async () => {
            setError(null)
            const r = await buyPackage(slug)
            if (r?.error) setError(r.error)
          })
        }
      >
        {pending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : label}
      </Button>
      {error && <p className="text-xs text-destructive text-center">{error}</p>}
    </div>
  )
}
