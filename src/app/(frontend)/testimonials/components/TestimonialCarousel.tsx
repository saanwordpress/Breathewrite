'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Star, ArrowRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Testimonial {
  quote: string
  name: string
  role?: string
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[]
}

export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  // Subtle parallax effect on the background
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])

  return (
    <section ref={containerRef} className="py-24 bg-secondary/5 relative overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50" />
      
      <div className="container mx-auto px-6 md:px-12 mb-12 relative z-10">
        <h3 className="text-3xl font-heading text-foreground mb-4">More Stories</h3>
        <p className="text-foreground/60 font-light">Swipe to explore experiences from our community.</p>
      </div>

      <div className="relative z-10 w-full overflow-x-auto pb-12 snap-x snap-mandatory hide-scrollbar pl-6 md:pl-12 lg:pl-[max(3rem,calc((100vw-80rem)/2))]">
        <div className="flex gap-6 w-max pr-6 md:pr-12">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
              key={idx}
              className="snap-start shrink-0 w-[85vw] md:w-[400px] lg:w-[450px] bg-card rounded-3xl p-8 border border-border/50 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              
              <p className="text-foreground/80 font-light text-[15px] leading-relaxed mb-8 line-clamp-4 flex-grow">
                &quot;{testimonial.quote}&quot;
              </p>

              <div className="mt-auto pt-6 border-t border-border/50 flex items-end justify-between">
                <div>
                  <p className="font-medium text-primary tracking-wide">{testimonial.name}</p>
                  {testimonial.role && <p className="text-xs text-foreground/50 mt-1 uppercase tracking-wider">{testimonial.role}</p>}
                </div>
                
                <Dialog>
                  <DialogTrigger render={<Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary/10 hover:text-secondary group" />}>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl md:max-w-3xl p-8 md:p-12">
                    <DialogHeader className="mb-8">
                      <div className="flex gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-5 h-5 fill-accent text-accent" />
                        ))}
                      </div>
                      <DialogTitle className="text-2xl font-heading text-primary">{testimonial.name}</DialogTitle>
                      {testimonial.role && <DialogDescription className="uppercase tracking-widest text-xs mt-1">{testimonial.role}</DialogDescription>}
                    </DialogHeader>
                    <div className="font-light text-foreground/90 text-lg leading-loose space-y-4">
                      <p>&quot;{testimonial.quote}&quot;</p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}
