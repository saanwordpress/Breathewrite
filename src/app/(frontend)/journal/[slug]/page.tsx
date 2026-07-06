import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function JournalPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  return (
    <div className="flex flex-col w-full bg-background pt-12 pb-24">
      <div className="container mx-auto px-6 md:px-12 max-w-3xl">
        <Button asChild variant="link" className="px-0 mb-8 text-muted-foreground hover:text-foreground">
          <Link href="/journal">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Journal
          </Link>
        </Button>

        <span className="text-sm font-medium text-accent tracking-wider uppercase mb-4 block">July 1, 2026</span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading mb-12 leading-tight">{title}</h1>

        <div className="aspect-video bg-muted rounded-3xl w-full mb-16 relative overflow-hidden">
           {/* Image Placeholder */}
        </div>

        <article className="prose prose-lg prose-neutral max-w-none font-light text-foreground/80 leading-relaxed">
          <p className="lead text-xl text-foreground font-medium mb-8">
            This is an introduction to the post. It sets the stage for what the reader is about to learn regarding breathwork and healing.
          </p>
          <p>
            When we experience trauma, stress, or burnout, the body stores it. The nervous system becomes dysregulated, leaving us in a constant state of hypervigilance.
          </p>
          <h2>The Role of the Vagus Nerve</h2>
          <p>
            The vagus nerve is the superhighway of the parasympathetic nervous system. By consciously altering the depth and rhythm of our breath, we send a direct signal to the brain that we are safe.
          </p>
          <blockquote>
            "Breath is the bridge which connects life to consciousness, which unites your body to your thoughts."
          </blockquote>
          <p>
            In Neurodynamic Breathwork, we use a specific circular breathing technique. This bypasses the default mode network—the part of the brain responsible for the ego and the inner critic.
          </p>
        </article>

        <div className="mt-24 pt-12 border-t border-border">
          <h3 className="text-2xl font-heading mb-6">Ready to experience this for yourself?</h3>
          <Button asChild size="lg" className="rounded-full px-8">
            <Link href="/book">Book a Session</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
