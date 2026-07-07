'use client'

import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'

interface FloatingQuoteProps {
  quote: string
  author?: string
  role?: string
}

export function FloatingQuote({ quote, author, role }: FloatingQuoteProps) {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden flex items-center justify-center bg-background">
      {/* Premium Ambient Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] max-w-[800px] aspect-square rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-6 md:px-12 max-w-4xl text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="relative"
        >
          {/* Decorative Oversized Quote Icon */}
          <div className="absolute -top-12 md:-top-20 left-1/2 -translate-x-1/2 text-accent/10 pointer-events-none">
            <Quote className="w-24 h-24 md:w-32 md:h-32" strokeWidth={1} fill="currentColor" />
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-7xl font-quote italic text-primary leading-relaxed md:leading-snug relative z-10 font-normal px-4 md:px-0">
            &quot;{quote}&quot;
          </h2>
          
          {author && (
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.4 }}
              className="mt-12 md:mt-16 flex flex-col items-center justify-center relative z-10"
            >
              <div className="w-12 h-[1px] bg-accent/50 mb-6" />
              <p className="font-heading text-xl md:text-2xl text-primary tracking-wide">
                {author}
              </p>
              {role && (
                <p className="mt-2 text-[10px] md:text-xs font-medium uppercase tracking-[0.2em] text-foreground/50">
                  {role}
                </p>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
