'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function ExpandableJourneyText() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="space-y-4 text-lg font-light text-foreground/80 leading-relaxed">
      <p>
        I’m Rosalind – a certified Neurodynamic Breathwork (NDB) facilitator, writer and scripted development consultant. After 20+ years of working in Film & TV, I went through a challenging period of personal loss, burnout and disconnection. I followed the pull to what felt grounding; creative play, poetry, hiking – and along that path I discovered breathwork.
      </p>
      
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden space-y-4"
          >
            <p>
              My experience with NDB has been deeply healing. It has helped me regulate my nervous system and anxiety, surrender what I cannot control, reconnect with the subconscious and honour the wisdom of the body.
            </p>
            <p>
              What began as a personal healing tool has evolved into a calling – to hold space for others seeking calm, creative flow, wholeness or simply a space to breathe and be.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-accent font-medium hover:text-primary transition-colors flex items-center gap-2 mt-4 uppercase tracking-wider text-sm"
      >
        {isExpanded ? (
          <>Read Less <ChevronUp className="w-4 h-4" /></>
        ) : (
          <>Read More <ChevronDown className="w-4 h-4" /></>
        )}
      </button>
    </div>
  )
}
