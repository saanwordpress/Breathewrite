'use client'

import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'

const TIMELINE_STEPS = [
  { stage: "Before", title: "Burnout", description: "Feeling overwhelmed, exhausted, and running on empty." },
  { stage: "The Catalyst", title: "Disconnection", description: "Losing touch with intuition and creative drive." },
  { stage: "The Shift", title: "First Session", description: "A profound release of stored tension and emotion." },
  { stage: "The Practice", title: "3 Months Later", description: "Integrating breathwork into daily life for steady grounding." },
  { stage: "The Result", title: "Calm & Clarity", description: "A resilient nervous system capable of deep rest." },
  { stage: "The Return", title: "Creative Flow", description: "Accessing new ideas without the inner critic." },
  { stage: "The Now", title: "Inner Peace", description: "Living from a place of trust and deep connection." },
]

export function SuccessStoryTimeline() {
  return (
    <section className="py-24 md:py-32 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent opacity-50" />
      
      <div className="container mx-auto px-6 md:px-12 max-w-4xl relative z-10">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-heading mb-6"
          >
            The Journey to Center
          </motion.h2>
          <p className="text-primary-foreground/70 text-lg font-light">
            Transformation doesn't happen overnight. It's a gentle unfolding.
          </p>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-primary-foreground/10 -translate-x-1/2" />

          <div className="space-y-12 md:space-y-24">
            {TIMELINE_STEPS.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={`relative flex flex-col md:flex-row gap-8 md:gap-16 items-start md:items-center ${
                  idx % 2 === 0 ? 'md:flex-row-reverse text-left md:text-right' : 'text-left'
                }`}
              >
                {/* Center Node */}
                <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-accent rounded-full -translate-x-1/2 mt-2 md:mt-0 shadow-[0_0_15px_rgba(var(--accent),0.5)]" />

                {/* Content */}
                <div className="ml-12 md:ml-0 md:w-1/2 pl-0 md:px-8">
                  <span className="text-accent text-sm tracking-widest uppercase font-medium mb-2 block">
                    {step.stage}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-heading mb-3">
                    {step.title}
                  </h3>
                  <p className="text-primary-foreground/70 font-light leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
