'use client'

import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const VIDEOS = [
  {
    id: 1,
    name: "A Journey to Calm",
    duration: "2:45",
    thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" // Generic placeholder
  },
  {
    id: 2,
    name: "Releasing Tension",
    duration: "3:12",
    thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    id: 3,
    name: "Finding Creative Flow",
    duration: "1:58",
    thumbnail: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=800",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  }
]

export function VideoTestimonials() {
  return (
    <section className="py-24 md:py-32 bg-background text-foreground">
      <div className="container mx-auto px-6 md:px-12 max-w-7xl">
        <div className="text-center mb-16 md:mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-heading mb-6"
          >
            Watch Their Journey
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg font-light text-foreground/60 max-w-2xl mx-auto"
          >
            Experience the transformative power of breathwork through the stories of those who have walked the path.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {VIDEOS.map((video, idx) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.15, duration: 0.6 }}
              className="group relative"
            >
              <Dialog>
                <DialogTrigger render={<button className="w-full text-left outline-none" />}>
                    <div className="relative aspect-[4/5] md:aspect-square rounded-3xl overflow-hidden mb-6 bg-muted isolate">
                      {/* Using standard img tags for placeholders */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={video.thumbnail} 
                        alt={video.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                      
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center text-primary shadow-xl transform transition-transform duration-300 group-hover:scale-110">
                          <Play className="w-6 h-6 ml-1" fill="currentColor" />
                        </div>
                      </div>

                      <div className="absolute bottom-6 right-6 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-white text-xs tracking-widest font-medium">
                        {video.duration}
                      </div>
                    </div>
                    <h3 className="text-xl font-heading text-primary group-hover:text-accent transition-colors">
                      {video.name}
                    </h3>
                </DialogTrigger>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-none">
                  <DialogTitle className="sr-only">Video: {video.name}</DialogTitle>
                  <div className="aspect-video w-full">
                    <iframe 
                      src={video.videoUrl} 
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
