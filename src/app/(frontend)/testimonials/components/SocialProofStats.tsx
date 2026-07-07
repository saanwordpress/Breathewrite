'use client'

import { motion } from 'framer-motion'

const STATS = [
  { value: "500+", label: "Guided Sessions" },
  { value: "4.9", label: "Average Rating", suffix: "★" },
  { value: "95%", label: "Return Rate" },
  { value: "10k+", label: "Breaths Taken" },
]

export function SocialProofStats() {
  return (
    <section className="py-20 border-y border-border/40 bg-card/50">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8">
          {STATS.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl lg:text-6xl font-heading text-primary mb-2 flex items-center justify-center">
                {stat.value}
                {stat.suffix && <span className="text-accent text-3xl md:text-4xl ml-1">{stat.suffix}</span>}
              </div>
              <p className="text-sm md:text-base text-foreground/60 tracking-widest uppercase font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
