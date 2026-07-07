import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Wind, Brain, Heart, Sparkles, Star } from 'lucide-react'
import { ExpandableJourneyText } from '@/components/expandable-journey-text'

const BENEFITS = [
  {
    title: 'Nervous System Regulation',
    description: 'Learn to shift from fight-or-flight into deep rest and restoration.',
    icon: Wind,
  },
  {
    title: 'Emotional Healing',
    description: 'Process stored emotions safely through guided breathwork techniques.',
    icon: Heart,
  },
  {
    title: 'Mental Clarity',
    description: 'Clear the mental fog and reconnect with your inner intuition.',
    icon: Brain,
  },
  {
    title: 'Creativity Awakens',
    description: 'Unlock creative flow by bypassing the analytical mind.',
    icon: Sparkles,
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover"
          >
            <source src="/offerings/01_Home_video_hero-image.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="container relative z-20 mx-auto px-6 md:px-12 py-24 text-center max-w-4xl text-white">
          <span className="text-white/80 uppercase tracking-[0.2em] text-sm font-semibold mb-6 block">
            Breathe Write
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading mb-8 leading-tight">
            Be still. Breathe. Know.
          </h1>
          <p className="text-xl md:text-2xl font-light text-foreground/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            Through breathing, the body remembers. And you can return – not to who you were told to be – but to who you have always been becoming.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg w-full sm:w-auto bg-white text-black hover:bg-white/90">
              <Link href="/calendar">
                Book Your First Session
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 py-6 text-lg w-full sm:w-auto bg-transparent border-white text-white hover:bg-white hover:text-black">
              <Link href="/membership">Explore Membership</Link>
            </Button>
          </div>
          <div className="mt-16 flex items-center justify-center gap-8 text-sm font-light text-white/60">
            <span>Certified Facilitator</span>
            <span className="hidden sm:inline">•</span>
            <span>20+ Years Experience</span>
            <span className="hidden sm:inline">•</span>
            <span>Hundreds of Guided Sessions</span>
          </div>
        </div>
      </section>

      {/* FOUNDER STORY */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="aspect-[4/5] bg-muted rounded-[2rem] relative overflow-hidden shadow-2xl">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src="/offerings/rosalind-image.jpg" alt="Rosalind in Morning Light" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="text-accent uppercase tracking-widest text-sm font-semibold block">MY JOURNEY</span>
                <h2 className="text-4xl md:text-5xl font-heading leading-tight text-primary">
                  From burnout to breath
                </h2>
              </div>
              
              <div className="space-y-4 text-lg font-light text-foreground/80 leading-relaxed">
                <p>
                  I’m Rosalind – a certified Neurodynamic Breathwork (NDB) facilitator, writer and scripted development consultant. After 20+ years of working in Film & TV, I went through a challenging period of personal loss, burnout and disconnection. I followed the pull to what felt grounding; creative play, poetry, hiking – and along that path I discovered breathwork.
                </p>
                <p>
                  My experience with NDB has been deeply healing. It has helped me regulate my nervous system and anxiety, surrender what I cannot control, reconnect with the subconscious and honour the wisdom of the body.
                </p>
                <p>
                  What began as a personal healing tool has evolved into a calling – to hold space for others seeking calm, creative flow, wholeness or simply a space to breathe and be.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* HEALTH BENEFITS */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-heading mb-16">The Science of Breath</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {BENEFITS.map((benefit, idx) => {
              const Icon = benefit.icon
              return (
                <div key={idx} className="bg-primary-foreground/5 p-8 rounded-3xl border border-primary-foreground/10 hover:bg-primary-foreground/10 transition-colors text-left">
                  <div className="w-12 h-12 rounded-full bg-accent text-primary flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-medium mb-3">{benefit.title}</h3>
                  <p className="text-primary-foreground/70 font-light leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FEATURED CLASSES / OFFERINGS */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <h2 className="text-4xl md:text-5xl font-heading">Our Offerings</h2>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/offerings">View All Offerings</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mock Offering Cards */}
            {[
              { title: 'Breathe & Flow', time: '60 Mins', type: 'Online Group', image: '/offerings/Breathe-Flow-icon.png', slug: 'breathe-and-flow' },
              { title: 'Neurodynamic Breathwork', time: '120 Mins', type: 'Online Group', image: '/offerings/Neurodynamic-Breathwork-icon.png', slug: 'neurodynamic-breathwork' },
              { title: 'Private 1:1 Session | 60 mins', time: '60 Mins', type: 'Online Private', image: '/offerings/Private-11-Online-Session-60mins-icon.png', slug: 'private-11-online-session-60-mins' }
            ].map((offering, idx) => (
              <div key={idx} className="group relative rounded-[2rem] overflow-hidden border border-border bg-card p-2 flex flex-col h-full hover:shadow-2xl transition-all duration-500">
                <div className="aspect-[4/3] bg-[#F9F8F6] rounded-[1.5rem] mb-6 relative overflow-hidden p-12 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={offering.image} alt={offering.title} className="w-24 h-24 object-contain group-hover:scale-110 transition-transform duration-700 ease-out opacity-80" />
                </div>
                <div className="px-6 pb-8 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-heading">{offering.title}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground font-light mb-6 flex-grow">
                    <span>{offering.time}</span>
                    <span>•</span>
                    <span>{offering.type}</span>
                  </div>
                  <Button asChild className="w-full rounded-full relative z-20">
                    <Link href={`/calendar`}>Book Now</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE SECTION */}
      <section className="relative py-32 md:py-48 flex items-center justify-center overflow-hidden">
        {/* Parallax Background Image */}
        <div className="absolute inset-0 z-0 bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/offerings/quote-bg.png" 
            alt="Breathwork Quote Background" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-6 md:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <blockquote 
              style={{ fontFamily: "'Romie', serif", fontWeight: 300 }}
              className="text-4xl md:text-5xl lg:text-6xl italic text-white leading-tight mb-8 drop-shadow-lg"
            >
              "In this silent breath, I feel the weight of the world fall away, and all that remains is the heartbeat of existence itself"
            </blockquote>
            <p className="text-white/80 font-medium tracking-wide text-lg drop-shadow-md">
              – Ursula K. Le Guin
            </p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-32 md:py-48 bg-[#F9F8F6]">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <span className="text-accent uppercase tracking-[0.2em] text-sm font-semibold mb-4 block">
            testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-heading mb-16 text-primary">
            Surrender to the Breath. Trust the Process.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 text-left">
            {[
              {
                quote: "Rosalind creates such a safe, nurturing space. I always leave feeling clearer, lighter and deeply connected.",
                author: "Emma R."
              },
              {
                quote: "The 1:1 session completely shifted my perspective. I was able to release tension I didn't even know I was holding onto.",
                author: "James T."
              },
              {
                quote: "I've tried meditation for years, but nothing allowed me to drop into my body as quickly as this breathwork journey.",
                author: "Sarah L."
              }
            ].map((testimony, idx) => (
              <div key={idx} className="bg-white p-10 rounded-[2rem] shadow-sm border border-border/40 hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-[#EBCBBA] mb-6">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                  </div>
                  <p className="text-lg font-light text-primary leading-relaxed mb-8 italic">
                    "{testimony.quote}"
                  </p>
                </div>
                <p className="text-sm font-medium text-muted-foreground">— {testimony.author}</p>
              </div>
            ))}
          </div>

          <Button asChild variant="outline" size="lg" className="rounded-full px-8 py-6 text-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            <Link href="/testimonials">All testimonials</Link>
          </Button>
        </div>
      </section>

    </div>
  )
}
