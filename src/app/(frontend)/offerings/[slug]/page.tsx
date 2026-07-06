import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Clock, Users, Calendar, Play, CheckCircle2, XCircle, Heart, Star, Check } from 'lucide-react'

// Data mapping based on user specifications
const offeringsData: Record<string, any> = {
  'breathe-and-flow': {
    badge: 'GROUP SESSION',
    title: 'Breathe & Flow',
    subtitle: 'Slow down. Breathe deep. Come home to you.',
    description: 'A 50 min guided breathwork journey. Slower, deeper, circular breathing to relaxing music.',
    duration: '60 - 90 Minutes',
    type: 'Online Group Session',
    availability: 'Multiple Dates Available',
    price: '$35',
    comingSoon: false,
    heroImage: '/offerings/breathe-and-flow.jpg',
    sidebarImage: '/offerings/breathe-and-flow.jpg',
  },
  'breathe-and-go': {
    badge: 'QUICK RESET',
    title: 'Breathe & Go',
    subtitle: 'Reset & relax.',
    description: 'A 20 min guided recentring session. Slower, deeper breathing to music to reset & relax.',
    duration: '20 Minutes',
    type: 'Online Session',
    availability: 'Multiple Dates Available',
    price: '$15',
    comingSoon: false,
    heroImage: '/offerings/breathe-and-go.jpg',
    sidebarImage: '/offerings/breathe-and-go.jpg',
  },
  'breathe-and-write': {
    badge: 'CREATIVE WORKSHOP',
    title: 'Breathe & Write',
    subtitle: 'Align you with your inner voice & creative flow.',
    description: 'A 120 min guided breath & writing session. Align you with your inner voice & creative flow.',
    duration: '120 Minutes',
    type: 'Online Group Session',
    availability: 'Multiple Dates Available',
    price: '$50',
    comingSoon: false,
    heroImage: '/offerings/breathe-and-write.jpg',
    sidebarImage: '/offerings/breathe-and-write.jpg',
  },
  'neurodynamic-breathwork': {
    badge: 'DEEP JOURNEY',
    title: 'Neurodynamic Breathwork',
    subtitle: 'Activating a deep inner journey.',
    description: 'A 90-120min facilitated session. Faster, deeper, circular breathing to curated music, activating a deep inner journey.',
    duration: '90 - 120 Minutes',
    type: 'Online Group Session',
    availability: 'Multiple Dates Available',
    price: '$45',
    comingSoon: false,
    heroImage: '/offerings/neurodynamic-breathwork.jpg',
    sidebarImage: '/offerings/neurodynamic-breathwork.jpg',
  },
  'private-11-online-session-60-mins': {
    badge: 'PRIVATE SESSION',
    title: 'Private 1:1 Online Session',
    subtitle: 'Tailored & guided Breathe & Flow session.',
    description: 'A 60 min private, tailored & guided Breathe & Flow session using slower, deeper circular breathing to curated music.',
    duration: '60 Minutes',
    type: 'Private 1:1 Session',
    availability: 'Available by Appointment',
    price: '$120',
    comingSoon: false,
    // Same image as Breathe & Go
    heroImage: '/offerings/breathe-and-go.jpg',
    sidebarImage: '/offerings/breathe-and-go.jpg',
  },
  'private-11-onlinesession-120-mins': {
    badge: 'PRIVATE SESSION',
    title: 'Private 1:1 Online Session',
    subtitle: 'Private facilitated Neurodynamic breathwork.',
    description: 'A private facilitated, 120 min Neurodynamic breathwork session incorporating deeper, faster circular breathing to curated music.',
    duration: '120 Minutes',
    type: 'Private 1:1 Session',
    availability: 'Available by Appointment',
    price: '$200',
    comingSoon: false,
    // Same image as Corporate wellness
    heroImage: '/offerings/corporate-wellness.jpg',
    sidebarImage: '/offerings/corporate-wellness.jpg',
  },
  'corporate-wellness': {
    badge: 'CORPORATE',
    title: 'Corporate Wellness',
    subtitle: 'Bring the transformative power of breathwork to your workplace.',
    description: 'Bring the transformative power of breathwork to your workplace or Film/TV set with our corporate wellness sessions.',
    duration: 'Custom',
    type: 'Group/Corporate',
    availability: 'Contact for Dates',
    price: 'Custom',
    comingSoon: false,
    heroImage: '/offerings/corporate-wellness.jpg',
    sidebarImage: '/offerings/corporate-wellness.jpg',
  },
  'breathe-and-move': {
    badge: 'COMING SOON',
    title: 'Breathe & Move',
    subtitle: 'Move your body with breath.',
    description: 'Coming Soon',
    duration: 'TBD',
    type: 'TBD',
    availability: 'Coming Soon',
    price: 'TBD',
    comingSoon: true,
  },
  'in-person-events': {
    badge: 'COMING SOON',
    title: 'In Person Events',
    subtitle: 'Connect in real life.',
    description: 'Coming Soon',
    duration: 'TBD',
    type: 'In Person',
    availability: 'Coming Soon',
    price: 'TBD',
    comingSoon: true,
  }
}

export default async function OfferingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const defaultData = offeringsData['breathe-and-flow']
  // Support variations in slug formatting
  const normalizedSlug = slug.toLowerCase().trim()
  const data = offeringsData[normalizedSlug] || offeringsData[normalizedSlug.replace('-mins', '')] || defaultData

  return (
    <div className="bg-[#F9F8F6] min-h-screen font-sans text-foreground">
      {/* Back to offerings */}
      <div className="container mx-auto px-6 pt-12">
        <Button asChild variant="link" className="px-0 text-muted-foreground hover:text-foreground">
          <Link href="/offerings">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Offerings
          </Link>
        </Button>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-16 xl:gap-24 items-center">
          <div className="space-y-8 max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#EBCBBA]/30 text-primary text-xs font-bold tracking-widest uppercase">
              {data.badge}
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-medium tracking-tight text-primary">
              {data.title}
            </h1>
            <div className="w-16 h-[2px] bg-border my-6"></div>
            <p className="text-2xl md:text-3xl font-light text-primary leading-snug">
              {data.subtitle}
            </p>
            <p className="text-lg text-muted-foreground font-light leading-relaxed">
              {data.description}
            </p>
            
            {/* Features 2x2 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-border/50">
              <div className="flex flex-col gap-4 group">
                 <div className="w-12 h-12 rounded-xl border border-[#EBCBBA] flex items-center justify-center text-[#EBCBBA] group-hover:bg-[#EBCBBA] group-hover:text-primary transition-colors duration-300">
                   <Heart className="w-5 h-5" />
                 </div>
                 <span className="text-sm font-medium leading-tight">Guided<br/>Breathwork</span>
              </div>
              <div className="flex flex-col gap-4 group">
                 <div className="w-12 h-12 rounded-xl border border-[#EBCBBA] flex items-center justify-center text-[#EBCBBA] group-hover:bg-[#EBCBBA] group-hover:text-primary transition-colors duration-300">
                   <Clock className="w-5 h-5" />
                 </div>
                 <span className="text-sm font-medium leading-tight">Relaxing<br/>Music</span>
              </div>
              <div className="flex flex-col gap-4 group">
                 <div className="w-12 h-12 rounded-xl border border-[#EBCBBA] flex items-center justify-center text-[#EBCBBA] group-hover:bg-[#EBCBBA] group-hover:text-primary transition-colors duration-300">
                   <CheckCircle2 className="w-5 h-5" />
                 </div>
                 <span className="text-sm font-medium leading-tight">Safe &<br/>Supportive</span>
              </div>
              <div className="flex flex-col gap-4 group">
                 <div className="w-12 h-12 rounded-xl border border-[#EBCBBA] flex items-center justify-center text-[#EBCBBA] group-hover:bg-[#EBCBBA] group-hover:text-primary transition-colors duration-300">
                   <Users className="w-5 h-5" />
                 </div>
                 <span className="text-sm font-medium leading-tight">All Welcome</span>
              </div>
            </div>
          </div>

          <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-muted group shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={data.heroImage || `/Breathe Write _ Wellness & Breathwork_files/${slug}.jpg`} 
              alt={data.title} 
              className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-1000 ease-out" 
            />
            <div className="absolute inset-0 bg-black/10 transition-colors duration-500"></div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="flex items-center gap-4 bg-white/95 backdrop-blur-md px-6 py-4 rounded-full shadow-2xl transform group-hover:scale-105 hover:bg-white transition-all duration-300">
                <div className="w-12 h-12 rounded-full border border-primary flex items-center justify-center">
                  <Play className="w-5 h-5 text-primary ml-1" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold text-primary">What is Breathwork?</span>
                  <span className="text-xs text-muted-foreground">Watch 60s video</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Meta Bar */}
      <div className="bg-white border-y border-border/60">
        <div className="container mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-8 md:gap-16">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Clock className="w-5 h-5 text-[#EBCBBA]" />
              <span className="text-sm font-medium">{data.duration}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Users className="w-5 h-5 text-[#EBCBBA]" />
              <span className="text-sm font-medium">{data.type}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Calendar className="w-5 h-5 text-[#EBCBBA]" />
              <span className="text-sm font-medium">{data.availability}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[#EBCBBA]">
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current text-[#EBCBBA]/50" />
            </div>
            <span className="text-sm text-muted-foreground font-medium ml-2">4.9 (126 reviews)</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="container mx-auto px-6 py-24">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-16 lg:gap-24 relative">
          
          {/* Left Column */}
          <div className="space-y-24">
            <div className="space-y-8">
              <h2 className="text-4xl font-heading text-primary">About This Session</h2>
              <p className="text-lg text-muted-foreground font-light leading-relaxed max-w-3xl">
                {data.title} is a gently guided breathwork experience that helps you slow down, regulate your nervous system and reconnect with your inner calm. Through slower, deeper, circular breathing and relaxing music, you'll be supported to release tension, quiet the mind and come back to yourself.
              </p>
            </div>

            <div className="space-y-10">
              <h3 className="text-2xl font-heading text-primary">Who is this for?</h3>
              <ul className="space-y-6 max-w-2xl">
                {[
                  'Anyone feeling overwhelmed or stressed',
                  'Those seeking a deeper connection to their intuition',
                  'People looking to release stored emotions safely',
                  'Anyone wanting to improve their sleep and energy',
                  'Those curious about breathwork and inner exploration'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-5 text-muted-foreground group">
                    <div className="mt-1 bg-[#EBCBBA]/20 rounded-full p-1.5 group-hover:bg-[#EBCBBA] transition-colors duration-300">
                      <Check className="w-4 h-4 text-[#EBCBBA] group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-lg font-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-12">
              <h3 className="text-3xl font-heading text-primary border-b border-border/50 pb-6">What to Expect</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
                {[
                  { title: 'Arrival & Settle', desc: 'A few minutes to arrive, get comfortable and set an intention.', icon: Users },
                  { title: 'Guided Breathwork', desc: "You'll be guided through a powerful circular breathing practice.", icon: Clock },
                  { title: 'Integration', desc: 'Time to rest, reflect and integrate your experience with calming music.', icon: Calendar },
                  { title: 'Close & Ground', desc: "We'll gently close the session together and you'll leave feeling lighter and more connected.", icon: Heart },
                ].map((step, i) => (
                  <div key={i} className="space-y-5 group">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-border flex items-center justify-center text-[#EBCBBA] group-hover:border-[#EBCBBA] transition-all duration-300 group-hover:scale-105 shadow-sm">
                      <step.icon className="w-7 h-7" />
                    </div>
                    <h4 className="text-xl font-heading text-primary">{step.title}</h4>
                    <p className="text-muted-foreground font-light leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="space-y-8 relative">
            <div className="xl:sticky xl:top-32 space-y-12 pb-24">
              {/* Quote Image Card */}
              <div className="relative rounded-[2rem] overflow-hidden bg-muted aspect-[4/5] shadow-lg group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={data.sidebarImage || `/Breathe Write _ Wellness & Breathwork_files/${slug}-sidebar.jpg`} 
                  alt="Session preview" 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-xl rounded-2xl p-8 shadow-xl transform transition-transform duration-500">
                  <span className="text-6xl text-[#EBCBBA] font-serif leading-none absolute -top-6 left-6">"</span>
                  <p className="text-xl font-heading text-primary leading-snug mt-4 relative z-10 italic">
                    The breath is the bridge between your body and your mind.
                  </p>
                  <p className="text-sm text-muted-foreground mt-4 font-medium">— Rosalind</p>
                </div>
              </div>

              {/* Pricing Card */}
              <div className="bg-white rounded-[2rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/40 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all duration-500">
                <div className="space-y-2 mb-10">
                  <h3 className="text-xl font-medium text-muted-foreground font-heading">Price</h3>
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl font-heading text-primary">{data.price}</span>
                    <span className="text-muted-foreground font-light text-lg">per session</span>
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                  <Button asChild className="w-full rounded-full py-7 text-lg hover:-translate-y-1 transition-transform shadow-md hover:shadow-xl font-medium">
                    <Link href="/book">View Upcoming Dates</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full rounded-full py-7 text-lg bg-[#EBCBBA]/20 border-transparent text-primary hover:bg-[#EBCBBA]/30 hover:border-[#EBCBBA] hover:-translate-y-1 transition-all font-medium">
                    <Link href="/book">Book This Session</Link>
                  </Button>
                </div>

                <ul className="space-y-5 mb-10">
                  {[
                    { text: 'Secure your spot in seconds', check: true },
                    { text: 'Instant confirmation', check: true },
                    { text: 'Free for Members', check: true },
                    { text: 'Cancellation up to 24h before', check: false },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-[15px] text-muted-foreground font-light">
                      {item.check ? (
                        <CheckCircle2 className="w-5 h-5 text-[#EBCBBA]" />
                      ) : (
                        <XCircle className="w-5 h-5 text-muted-foreground/30" />
                      )}
                      {item.text}
                    </li>
                  ))}
                </ul>

                <Link href="/membership" className="block bg-[#F9F8F6] rounded-2xl p-6 group cursor-pointer hover:bg-muted transition-colors border border-transparent hover:border-border/50">
                  <h4 className="font-heading text-lg mb-2 text-primary">Members go free</h4>
                  <p className="text-[15px] text-muted-foreground font-light mb-4 leading-relaxed">Unlimited access to all group sessions and exclusive content.</p>
                  <div className="text-sm font-medium text-primary flex items-center gap-2 group-hover:gap-4 transition-all">
                    Explore Membership <ArrowLeft className="w-4 h-4 rotate-180" />
                  </div>
                </Link>

                <div className="mt-8 pt-8 border-t border-border/60 text-left">
                  <p className="text-[15px] font-medium text-primary mb-1">Have questions?</p>
                  <p className="text-[15px] text-muted-foreground font-light">
                    <Link href="/contact" className="underline hover:text-primary transition-colors">Contact us</Link>, we're here to help.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA & FAQ Section */}
      <section className="bg-white border-t border-border/50">
        <div className="container mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            
            {/* Social Proof */}
            <div className="space-y-8">
              <h2 className="text-4xl font-heading text-primary">Loved by<br/>Our Community</h2>
              <p className="text-lg text-muted-foreground font-light max-w-sm leading-relaxed">
                Real experiences from real people. Real transformation.
              </p>
              <Button asChild variant="outline" className="rounded-full px-8 py-6 bg-[#EBCBBA]/20 border-transparent text-primary hover:bg-[#EBCBBA]/40">
                <Link href="/about">See All Reviews</Link>
              </Button>
            </div>

            {/* Review Card Highlight */}
            <div className="bg-[#F9F8F6] rounded-[2rem] p-10 shadow-sm border border-border/40 space-y-6">
              <div className="flex items-center gap-1 text-[#EBCBBA]">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-lg font-light text-primary leading-relaxed">
                "Rosalind creates such a safe, nurturing space. I always leave feeling clearer, lighter and deeply connected."
              </p>
              <p className="text-sm font-medium text-muted-foreground">— Emma R.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Sticky-style Footer CTA */}
      <section className="bg-[#F9F8F6] border-t border-border py-16">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-[#EBCBBA]/20 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-[#EBCBBA]" />
            </div>
            <div>
              <h3 className="text-2xl font-heading text-primary">Ready to join?</h3>
              <p className="text-muted-foreground font-light mt-1">Choose a date that works for you and take the first step.</p>
            </div>
          </div>
          <Button asChild className="rounded-full py-7 px-10 text-lg hover:-translate-y-1 transition-transform shadow-lg hover:shadow-xl font-medium w-full md:w-auto">
            <Link href="/book">View Upcoming Dates</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
