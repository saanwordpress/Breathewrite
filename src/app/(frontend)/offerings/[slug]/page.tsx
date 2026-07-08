import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Clock, Users, Calendar, CheckCircle2, Star, ShieldCheck, Heart, Sparkles, MapPin, Zap } from 'lucide-react'
import { FaqAccordion } from '@/components/faq-accordion'

// Data mapping based on user specifications
const offeringsData: Record<string, any> = {
  'breathe-and-flow': {
    badge: 'GROUP SESSION',
    title: 'Breathe & Flow',
    subtitle: 'Slow down. Reconnect. Breathe deeply.',
    duration: '60 - 90 Minutes',
    type: 'Online Group Session',
    idealFor: 'Releasing stress and grounding.',
    modality: 'Online',
    price: '$35',
    comingSoon: false,
    heroImage: '/offerings/breathe-and-flow.jpg',
  },
  'breathe-and-go': {
    badge: 'QUICK RESET',
    title: 'Breathe & Go',
    subtitle: 'A midday reset for clarity.',
    duration: '20 Minutes',
    type: 'Online Session',
    idealFor: 'Clearing mental fog.',
    modality: 'Online',
    price: '$15',
    comingSoon: false,
    heroImage: '/offerings/breathe-and-go.jpg',
  },
  'breathe-and-write': {
    badge: 'CREATIVE WORKSHOP',
    title: 'Breathe & Write',
    subtitle: 'Unblock your creative flow.',
    duration: '120 Minutes',
    type: 'Online Group Session',
    idealFor: 'Writers & creatives seeking clarity.',
    modality: 'Online',
    price: '$50',
    comingSoon: false,
    heroImage: '/offerings/breathe-and-write.jpg',
  },
  'neurodynamic-breathwork': {
    badge: 'DEEP JOURNEY',
    title: 'Neurodynamic Breathwork',
    subtitle: 'Activating a deep inner journey.',
    duration: '90 - 120 Minutes',
    type: 'Online Group Session',
    idealFor: 'Deep emotional release.',
    modality: 'Online',
    price: '$45',
    comingSoon: false,
    heroImage: '/offerings/neurodynamic-breathwork.jpg',
  },
  'private-11-online-session-60-mins': {
    badge: 'PRIVATE SESSION',
    title: 'Private 1:1 Online Session',
    subtitle: 'Personalized emotional healing.',
    duration: '60 Minutes',
    type: 'Private 1:1 Session',
    idealFor: 'Tailored 1-on-1 support.',
    modality: 'Online',
    price: '$120',
    comingSoon: false,
    heroImage: '/offerings/breathe-and-go.jpg',
  },
  'private-11-onlinesession-120-mins': {
    badge: 'PRIVATE SESSION',
    title: 'Private 1:1 Online Session',
    subtitle: 'Deeper exploration and integration.',
    duration: '120 Minutes',
    type: 'Private 1:1 Session',
    idealFor: 'Extensive personal healing.',
    modality: 'Online',
    price: '$200',
    comingSoon: false,
    heroImage: '/offerings/corporate-wellness.jpg',
  },
  'corporate-wellness': {
    badge: 'CORPORATE',
    title: 'Corporate Wellness',
    subtitle: 'Bring calm to your team.',
    duration: 'Custom',
    type: 'Group/Corporate',
    idealFor: 'Teams reducing burnout.',
    modality: 'In Person / Online',
    price: 'Custom',
    comingSoon: false,
    heroImage: '/offerings/corporate-wellness.jpg',
  },
}

const FAQS = [
  { question: "Do I need any previous breathwork experience?", answer: "Not at all. This session is designed for both complete beginners and experienced breathers. You will be fully guided throughout the entire process." },
  { question: "What should I bring or wear?", answer: "Please wear loose, comfortable clothing. We recommend having a quiet, undisturbed space, a comfortable place to lie down (like a yoga mat or bed), an eye mask if you have one, and a blanket as body temperature can drop during breathwork." },
  { question: "Is this safe for everyone?", answer: "Breathwork is generally safe, but if you have a history of cardiovascular issues, severe asthma, epilepsy, or severe mental illness, please consult with your healthcare provider before booking a session." },
  { question: "What if I need to cancel my booking?", answer: "We offer free cancellations and full refunds up to 24 hours before the session begins. After that, we are unable to offer refunds as spots are limited." },
  { question: "Is this session recorded?", answer: "To respect the privacy and vulnerability of all participants, group sessions are never recorded." },
]

export default async function OfferingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const defaultData = offeringsData['breathe-and-flow']
  // Support variations in slug formatting
  const normalizedSlug = slug.toLowerCase().trim()
  const data = offeringsData[normalizedSlug] || offeringsData[normalizedSlug.replace('-mins', '')] || defaultData

  return (
    <div className="bg-[#F9F8F6] min-h-screen font-sans text-foreground pb-24 lg:pb-0">
      
      {/* Back Navigation */}
      <div className="container mx-auto px-6 pt-12 pb-6">
        <Button asChild variant="link" className="px-0 text-muted-foreground hover:text-foreground">
          <Link href="/offerings">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Offerings
          </Link>
        </Button>
      </div>

      {/* HERO SECTION - SPLIT LAYOUT */}
      <section className="container mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-12 xl:gap-20 items-center">
          
          {/* Left: Emotional & Data */}
          <div className="space-y-10">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-[#EBCBBA]/20 text-primary text-[10px] font-bold tracking-[0.2em] uppercase">
                {data.badge}
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading text-primary leading-none tracking-tight">
                {data.title}
              </h1>
              <p className="text-2xl md:text-3xl font-light text-primary/80 leading-snug mt-2">
                {data.subtitle}
              </p>
            </div>

            {/* Core Info Grid */}
            <div className="grid grid-cols-2 gap-y-6 gap-x-8 py-8 border-y border-border/50">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Duration</p>
                <p className="text-lg text-primary font-medium">{data.duration}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Price</p>
                <p className="text-lg text-primary font-medium">{data.price}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Session Type</p>
                <p className="text-lg text-primary font-medium">{data.type}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Ideal For</p>
                <p className="text-lg text-primary font-medium">{data.idealFor}</p>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-3">
              <div className="flex text-[#EBCBBA]">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-sm font-medium text-primary">
                4.9 Rating <span className="text-muted-foreground font-light ml-1">— Trusted by hundreds of clients.</span>
              </p>
            </div>

            {/* Desktop Hero CTAs */}
            <div className="hidden sm:flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Button asChild size="lg" className="rounded-full px-8 py-7 text-lg shadow-xl hover:-translate-y-1 transition-transform w-full sm:w-auto">
                <Link href={`/calendar`}>Book Your Session</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 py-7 text-lg bg-transparent border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 transition-colors w-full sm:w-auto">
                <Link href="/membership">Explore Membership</Link>
              </Button>
            </div>
            
            {/* Mobile Hero CTA (visible only on mobile) */}
            <div className="sm:hidden pt-2">
              <Button asChild size="lg" className="rounded-full px-8 py-7 text-lg shadow-xl w-full">
                <Link href={`/calendar`}>Book Your Session</Link>
              </Button>
            </div>
          </div>

          {/* Right: Premium Editorial Image (No Video) */}
          <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-muted shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-black/10 z-10 mix-blend-overlay"></div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={data.heroImage || `/Breathe Write _ Wellness & Breathwork_files/${slug}.jpg`} 
              alt={data.title} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-105" 
            />
          </div>

        </div>
      </section>

      {/* MAIN CONTENT & STICKY SIDEBAR */}
      <section className="container mx-auto px-6 py-12 md:py-24">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-16 lg:gap-24 relative">
          
          {/* LEFT: CONTENT FLOW */}
          <div className="space-y-24">
            
            {/* 1. Who this is for */}
            <div className="space-y-8">
              <h2 className="text-3xl font-heading text-primary">Who this is for</h2>
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-border/40">
                <p className="text-lg font-medium text-primary mb-6">Perfect if you:</p>
                <ul className="space-y-5">
                  {[
                    'Feel overwhelmed and constantly "on"',
                    'Need to calm and regulate your nervous system',
                    'Want to improve your sleep quality',
                    'Need a safe space for emotional regulation',
                    'Want creative clarity and inner connection'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-muted-foreground group">
                      <div className="mt-1 flex-shrink-0 bg-[#EBCBBA]/20 rounded-full p-1 group-hover:bg-[#EBCBBA] transition-colors duration-300">
                        <CheckCircle2 className="w-4 h-4 text-[#EBCBBA] group-hover:text-white" />
                      </div>
                      <span className="text-lg font-light leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 2. What You'll Experience (Visual Flow) */}
            <div className="space-y-8">
              <h2 className="text-3xl font-heading text-primary">What You'll Experience</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { step: '01', title: 'Arrival', desc: 'Settle in and set your intention.', icon: Users },
                  { step: '02', title: 'Breathwork', desc: 'Guided circular breathing.', icon: Wind },
                  { step: '03', title: 'Integration', desc: 'Rest with calming music.', icon: Sparkles },
                  { step: '04', title: 'Grounding', desc: 'Close out feeling lighter.', icon: Heart },
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 border border-border/40 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    <span className="absolute top-6 right-6 text-5xl font-heading text-muted-foreground/5 opacity-50 group-hover:text-[#EBCBBA]/10 transition-colors">
                      {item.step}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-[#F9F8F6] flex items-center justify-center text-primary mb-6 relative z-10">
                      <item.icon className="w-6 h-6 text-[#EBCBBA]" />
                    </div>
                    <h3 className="text-xl font-heading text-primary mb-2 relative z-10">{item.title}</h3>
                    <p className="text-sm font-light text-muted-foreground leading-relaxed relative z-10">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Beautiful Highlights */}
            <div className="space-y-8">
              <h2 className="text-3xl font-heading text-primary">Session Highlights</h2>
              <div className="flex flex-wrap gap-4">
                {[
                  { text: data.duration, icon: Clock },
                  { text: data.modality, icon: MapPin },
                  { text: 'Beginner Friendly', icon: Star },
                  { text: 'Guided Experience', icon: Sparkles },
                  { text: 'Calming Music', icon: Heart },
                ].map((highlight, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white border border-border/60 px-5 py-3 rounded-full shadow-sm">
                    <highlight.icon className="w-4 h-4 text-[#EBCBBA]" />
                    <span className="text-sm font-medium text-primary">{highlight.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Trust Section (Rich Testimonial) */}
            <div className="space-y-8">
              <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-border/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#EBCBBA]/5 rounded-bl-full -z-0"></div>
                <div className="relative z-10">
                  <div className="flex text-[#EBCBBA] mb-6">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 fill-current" />)}
                  </div>
                  <blockquote 
                    style={{ fontFamily: "'Romie', serif", fontWeight: 300 }}
                    className="text-2xl md:text-3xl text-primary leading-tight mb-8"
                  >
                    "Rosalind helped me reconnect with myself in a way I hadn't felt in years. The space she holds is incredibly safe and deeply transformative."
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-muted border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/offerings/rosalind-image.jpg" alt="Reviewer" className="w-full h-full object-cover opacity-80" />
                    </div>
                    <div>
                      <p className="text-base font-medium text-primary">Sarah L.</p>
                      <p className="text-sm font-light text-muted-foreground">London, UK</p>
                    </div>
                  </div>
                  <div className="mt-8 pt-8 border-t border-border/50">
                    <Button variant="link" className="px-0 text-primary hover:text-[#EBCBBA]">
                      Read More Stories <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Booking Flow Preview */}
            <div className="space-y-8">
              <h2 className="text-3xl font-heading text-primary">How it works</h2>
              <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-border/40 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 relative">
                
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-px bg-border/60 -translate-y-1/2 z-0"></div>

                <div className="flex flex-col items-center text-center relative z-10 bg-white px-4">
                  <div className="w-16 h-16 rounded-full bg-[#F9F8F6] border border-border flex items-center justify-center mb-4 text-primary">
                    <Calendar className="w-6 h-6 text-[#EBCBBA]" />
                  </div>
                  <h4 className="text-lg font-medium text-primary mb-1">Choose Date</h4>
                  <p className="text-sm font-light text-muted-foreground">Pick a time that suits you.</p>
                </div>
                
                <div className="flex flex-col items-center text-center relative z-10 bg-white px-4">
                  <div className="w-16 h-16 rounded-full bg-[#F9F8F6] border border-border flex items-center justify-center mb-4 text-primary">
                    <ShieldCheck className="w-6 h-6 text-[#EBCBBA]" />
                  </div>
                  <h4 className="text-lg font-medium text-primary mb-1">Complete Payment</h4>
                  <p className="text-sm font-light text-muted-foreground">Secure & instant confirmation.</p>
                </div>

                <div className="flex flex-col items-center text-center relative z-10 bg-white px-4">
                  <div className="w-16 h-16 rounded-full bg-[#F9F8F6] border border-border flex items-center justify-center mb-4 text-primary">
                    <Zap className="w-6 h-6 text-[#EBCBBA]" />
                  </div>
                  <h4 className="text-lg font-medium text-primary mb-1">Join Session</h4>
                  <p className="text-sm font-light text-muted-foreground">Receive your private link.</p>
                </div>
              </div>
            </div>

            {/* 6. FAQs */}
            <div className="space-y-8">
              <h2 className="text-3xl font-heading text-primary">Frequently Asked Questions</h2>
              <FaqAccordion items={FAQS} />
            </div>

          </div>

          {/* RIGHT: STICKY BOOKING CARD & UPSELL (DESKTOP) */}
          <div className="hidden xl:block relative">
            <div className="sticky top-32 space-y-8 pb-24">
              
              {/* Main Booking Card */}
              <div className="bg-white rounded-[2rem] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-border/60">
                <div className="space-y-6 mb-8">
                  <div className="flex items-baseline justify-between">
                    <span className="text-5xl font-heading text-primary">{data.price}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-[#EBCBBA] bg-[#EBCBBA]/10 px-4 py-2 rounded-lg">
                    <Calendar className="w-4 h-4" /> Next available session: This Week
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-3 border-b border-border/50">
                    <span className="text-muted-foreground font-light">Duration</span>
                    <span className="font-medium text-primary">{data.duration}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border/50">
                    <span className="text-muted-foreground font-light">Modality</span>
                    <span className="font-medium text-primary">{data.modality}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-muted-foreground font-light">Membership</span>
                    <span className="font-medium text-primary">Included</span>
                  </div>
                </div>

                <Button asChild className="w-full rounded-full py-7 text-lg shadow-xl hover:-translate-y-1 transition-transform font-medium mb-4">
                  <Link href={`/calendar`}>Book Now</Link>
                </Button>

                <div className="flex flex-col items-center gap-3 text-xs text-muted-foreground/80 mt-6 pt-6 border-t border-border/40">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-green-600/80" /> Secure Checkout</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-600/80" /> Free cancellation up to 24h</span>
                </div>
              </div>

              {/* Membership Upsell Card */}
              <div className="bg-[#1C1C1C] text-white rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full"></div>
                <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold tracking-widest uppercase mb-6">
                  Best Value
                </div>
                <h3 className="text-2xl font-heading mb-2">Become a Member</h3>
                <p className="text-sm text-white/60 font-light mb-6">Stop paying per session. Get unlimited access to all group sessions and exclusive content.</p>
                <ul className="space-y-3 mb-8">
                  {['Unlimited eligible sessions', 'Priority booking', 'Exclusive member content'].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm font-light text-white/80">
                      <CheckCircle2 className="w-4 h-4 text-[#EBCBBA]" /> {feature}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="w-full rounded-full py-6 bg-white text-black border-transparent hover:bg-white/90">
                  <Link href="/membership">Explore Membership</Link>
                </Button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* FINAL FULL-WIDTH CTA (DESKTOP) */}
      <section className="hidden xl:flex bg-white py-32 border-t border-border/50 items-center justify-center text-center">
        <div className="container max-w-3xl mx-auto px-6 space-y-8">
          <h2 className="text-5xl font-heading text-primary">Ready to Begin?</h2>
          <p className="text-xl font-light text-muted-foreground">Take your first step toward calm, clarity and connection.</p>
          <div className="pt-4">
            <Button asChild size="lg" className="rounded-full px-12 py-8 text-xl shadow-2xl hover:-translate-y-1 transition-transform">
              <Link href={`/calendar`}>Choose Your Date & Time</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* MOBILE STICKY BOTTOM CTA */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-border p-4 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</span>
          <span className="text-2xl font-heading text-primary leading-none">{data.price}</span>
        </div>
        <Button asChild className="rounded-full px-8 py-6 text-base shadow-md w-full max-w-[200px]">
          <Link href={`/calendar`}>Book Now</Link>
        </Button>
      </div>

    </div>
  )
}

function Wind(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.8 19.6A2 2 0 1 0 14 16H2" />
      <path d="M17.5 8a2.5 2.5 0 1 1 2 4H2" />
      <path d="M9.8 4.4A2 2 0 1 1 11 8H2" />
    </svg>
  )
}
