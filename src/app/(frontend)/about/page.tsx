import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full bg-background pt-12">
      <div className="container mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-8 sticky top-32">
            <h1 className="text-5xl md:text-6xl font-heading leading-tight">
              Meet Rosalind. <br />
              <span className="text-secondary text-4xl">Certified Neurodynamic Breathwork Facilitator.</span>
            </h1>
            <div className="aspect-[3/4] bg-muted rounded-2xl relative overflow-hidden mt-12 w-3/4">
               {/* Placeholder for Rosalind's Photo */}
               <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-light text-center p-6">
                 Image: Rosalind in a calm, peaceful setting
               </div>
            </div>
          </div>
          <div className="space-y-8 text-lg font-light text-foreground/80 leading-relaxed pt-4 lg:pt-0">
            <p className="text-2xl text-primary font-medium leading-normal mb-12">
              "Every breath becomes an invitation to surrender. Healing begins. Creativity awakens. Insight arrives. Peace becomes possible."
            </p>
            <p>
              Welcome to Breathe Write.
            </p>
            <p>
              I created this space as a sanctuary where people can disconnect from the relentless noise of everyday life and reconnect with their intuition, their creativity, and their breath.
            </p>
            <p>
              For over 20 years, I worked in Film & TV as a writer and script development consultant. The industry was demanding, fast-paced, and creatively exhausting. After experiencing deep burnout, grief, and personal loss, I hit a wall where words were no longer enough.
            </p>
            <p>
              That’s when I discovered Neurodynamic Breathwork.
            </p>
            <p>
              It became the anchor that allowed me to process what I couldn't articulate. Through breathwork, I found a way to release stored emotion, regulate my nervous system, and tap into a deeper well of creativity. 
            </p>
            <p>
              Today, my mission is to help others find that same stillness. Whether you are dealing with stress, seeking emotional healing, or looking to unlock your creative flow, I am here to guide you.
            </p>
            
            <div className="pt-12 border-t border-border mt-12">
              <h3 className="text-2xl font-heading text-primary mb-6">Credentials</h3>
              <ul className="space-y-4 text-base">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  Certified Neurodynamic Breathwork Facilitator
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  20+ Years in Film & TV
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  Hundreds of Guided Sessions
                </li>
              </ul>
            </div>

            <div className="pt-12">
              <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg">
                <Link href="/book">Book a Private Session</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
