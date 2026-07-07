'use client'

import { motion } from 'framer-motion'

interface FloatingQuoteProps {
  quote: string
}

export function FloatingQuote({ quote }: FloatingQuoteProps) {
  return (
    <section className="py-32 md:py-48 relative overflow-hidden flex items-center justify-center bg-background">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-150px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-heading italic text-primary/40 font-light leading-tight">
            &quot;{quote}&quot;
          </h2>
        </motion.div>
      </div>
    </section>
  )
}
