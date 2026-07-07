'use client'

import { motion } from 'framer-motion'

interface FloatingQuoteProps {
  quote: string
}

export function FloatingQuote({ quote }: FloatingQuoteProps) {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden flex items-center justify-center bg-background">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-primary/80 font-light leading-tight">
            &quot;{quote}&quot;
          </h2>
        </motion.div>
      </div>
    </section>
  )
}
