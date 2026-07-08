'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FAQItem {
  question: string
  answer: string
}

export function FaqAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="w-full space-y-4">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx
        return (
          <div 
            key={idx} 
            className={`border rounded-2xl overflow-hidden transition-colors duration-300 ${isOpen ? 'bg-white border-primary/20 shadow-sm' : 'bg-transparent border-border/60 hover:border-primary/20'}`}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
            >
              <span className={`text-lg font-medium transition-colors duration-300 ${isOpen ? 'text-primary' : 'text-primary/80'}`}>
                {item.question}
              </span>
              <ChevronDown 
                className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} 
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="px-6 pb-6 text-muted-foreground font-light leading-relaxed">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
