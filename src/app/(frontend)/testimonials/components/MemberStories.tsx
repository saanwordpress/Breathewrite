'use client'

import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'

const MEMBER_STORIES = [
  {
    quote: "I came to my breathwork session bearing a lot emotionally, mentally and physically. Finding alignment with my body and breath was a form of rescue and release that I sorely needed.",
    name: "Thomas C.",
    months: "14 Months",
    favorite: "Neurodynamic Breathwork"
  },
  {
    quote: "Working with Rosalind has been a game changer. I've been able to weather the storms of life with much more ease with her support. Her guidance is truly special.",
    name: "Vanessa R.",
    months: "8 Months",
    favorite: "Breathe & Flow"
  },
  {
    quote: "Breathwork is slowly and quietly transforming my inner and my outer life via a new attitude towards breathing. A heightened sense of awareness is gained.",
    name: "Endellion L.",
    months: "2+ Years",
    favorite: "Private 1:1 Sessions"
  }
]

export function MemberStories() {
  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-heading text-primary mb-6">Why I Became a Member</h2>
            <p className="text-lg text-foreground/60 font-light leading-relaxed">
              For many, one session is just the beginning. Our members integrate breathwork into their ongoing wellness routine to maintain clarity and resilience.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {MEMBER_STORIES.map((story, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.15, duration: 0.6 }}
              className="bg-background rounded-3xl p-8 md:p-10 border border-border/50 hover:shadow-lg transition-shadow duration-500 relative group"
            >
              <Quote className="w-10 h-10 text-accent/20 absolute top-8 right-8 group-hover:text-accent/40 transition-colors" />
              
              <div className="mb-8">
                <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary text-xs font-medium uppercase tracking-widest rounded-full mb-6">
                  Member for {story.months}
                </span>
                <p className="text-foreground/80 font-heading font-normal text-lg leading-relaxed relative z-10">
                  &quot;{story.quote}&quot;
                </p>
              </div>

              <div className="mt-auto pt-6 border-t border-border/50">
                <p className="font-heading text-primary text-lg">{story.name}</p>
                <p className="text-sm text-foreground/50 mt-1">Favorite: {story.favorite}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
