import Link from 'next/link'
import { Button } from '@/components/ui/button'

const POSTS = [
  { slug: 'the-science-of-breathwork', title: 'The Science Behind Neurodynamic Breathwork', date: 'July 1, 2026', excerpt: 'Discover how conscious breathing alters your brainwaves and down-regulates the nervous system.' },
  { slug: 'overcoming-burnout', title: 'Overcoming Creative Burnout', date: 'June 15, 2026', excerpt: 'How I used breathwork to rediscover my creative voice after twenty years in the film industry.' },
  { slug: 'what-to-expect-first-session', title: 'What to Expect in Your First Session', date: 'May 28, 2026', excerpt: 'Nervous about your first breathwork class? Here is a complete guide to help you prepare and surrender.' },
]

export default function JournalPage() {
  return (
    <div className="flex flex-col w-full bg-background pt-12 pb-24">
      {/* Hero */}
      <section className="py-24 text-center">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-heading mb-6">Journal</h1>
          <p className="text-xl font-light text-foreground/80 max-w-2xl mx-auto">
            Musings on breath, creativity, healing, and the art of surrender.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {POSTS.map((post, idx) => (
              <div key={post.slug} className={`group ${idx === 0 ? 'md:col-span-2' : ''}`}>
                <Link href={`/journal/${post.slug}`} className="block">
                  <div className={`bg-muted rounded-3xl w-full relative overflow-hidden mb-6 ${idx === 0 ? 'aspect-video' : 'aspect-[4/3]'}`}>
                    {/* Image Placeholder */}
                  </div>
                  <div className="space-y-3">
                    <span className="text-sm font-medium text-accent tracking-wider uppercase">{post.date}</span>
                    <h2 className={`${idx === 0 ? 'text-4xl' : 'text-2xl'} font-heading group-hover:text-primary/70 transition-colors`}>{post.title}</h2>
                    <p className="text-foreground/70 font-light leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
