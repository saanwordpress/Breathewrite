'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

interface FeaturedTestimonialProps {
  quote: string
  name: string
  role?: string
}

export function FeaturedTestimonial({ quote, name, role }: FeaturedTestimonialProps) {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background elements for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/5 to-transparent z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] z-0" />
      
      <div className="container relative z-10 mx-auto px-6 md:px-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="bg-card rounded-3xl p-10 md:p-16 shadow-xl border border-border/40 relative"
        >
          {/* Decorative Quote Icon */}
          <div className="absolute -top-6 -left-6 md:-top-8 md:-left-8 w-16 h-16 md:w-20 md:h-20 bg-accent rounded-full flex items-center justify-center shadow-lg">
            <Quote className="w-8 h-8 md:w-10 md:h-10 text-primary" strokeWidth={1.5} />
          </div>

          <div className="flex justify-center mb-8 gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-5 h-5 md:w-6 md:h-6 fill-accent text-accent" />
            ))}
          </div>

          <blockquote className="text-2xl md:text-4xl font-heading font-normal text-center leading-relaxed text-foreground/90 mb-10">
            &quot;{quote}&quot;
          </blockquote>

          <div className="text-center">
            <p className="font-heading text-xl text-primary">{name}</p>
            {role && <p className="text-sm uppercase tracking-widest text-foreground/50 mt-2">{role}</p>}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
