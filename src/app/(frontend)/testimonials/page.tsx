import { Star } from 'lucide-react'

const TESTIMONIALS = [
  {
    quote: "Rosalind held such a wonderful space for the loveliest breath work experience. It was incredibly relaxing and just what I needed, reminding me to connect back to myself and my body.",
    name: "Prano Bailey Bond",
    role: "Film Director & Screenwriter"
  },
  {
    quote: "Working with Rosalind has been a game changer. She holds such a safe, peaceful, and even playful space to explore breath and meditation. She curates an amazing playlist and closes her sessions with insight, reassurance, and a positive take away. I’ve been able to weather the storms of life with much more ease with her support!",
    name: "Vanessa Rose",
    role: "Writer & Director"
  },
  {
    quote: "Breathwork is slowly and quietly transforming my inner and my outer life via a new attitude towards breathing and the breath in general. Rosalind’s tailor-made consultations are thorough and profound. She is empathetic, full of understanding and has a sharp intelligence and a wealth of spiritual knowledge. May I highly recommend these journeys of self-discovery where a heightened sense of awareness is gained, along with a deep calmness — the result of Rosalind’s skills and dedication to her practice.",
    name: "Endellion Lycett Green",
    role: "Artist"
  },
  {
    quote: "My Neurodynamic Breathwork session with Rosalind was an amazing experience. She took the time to explain everything in detail, creating a space where I felt safe and supported the whole time. The environment was perfect, with all the little touches that made it comfortable and relaxing. The session itself was powerful—I was able to connect with parts of myself I don’t usually notice in daily life. Rosalind was there for me the whole time, attentive and present, which made me feel really cared for. I’m excited to keep going with the breathwork and see where it leads.",
    name: "Frida Delgado Pons",
    role: "Singer & Musician"
  },
  {
    quote: "My Neurodynamic Breathwork session with Rosalind was a profoundly deep and thoughtfully held experience. Both personally and professionally, I’ve explored many approaches that work with the mind–body connection, and this breathwork — supported by music — opened a state of awareness and oneness to life previously only encountered through ayahuasca ceremonies and meditation. My whole body felt alive with a sense of energy moving through me. I arrived at a deeply present, meditative state, opening me up to emotions and sensations, as if clearing and cleansing something at the level of spirit. I would wholeheartedly recommend the experience.",
    name: "Daniela Reyes",
    role: "Psychiatrist"
  },
  {
    quote: "I had an absolutely incredible experience with Rosalind’s Neurodynamic Breathwork. From the moment I arrived, I felt safe — truly safe — in her calm, gentle presence. The session took me into a profoundly deep state where I was able to see myself and my life from a completely different perspective. It brought clarity, a sense of purpose, and even moments that felt like a personal rebirth. The music was beautifully curated, guiding every sensation and emotion with so much care. I felt completely free to move, express, release, and just be, knowing Rosalind was there holding the space with so much kindness. The 60 minutes flew by like five. It was mind-blowing, transformative, and something I honestly can’t wait to experience again. Highly recommended.",
    name: "Jessica Lima",
    role: "Yoga Teacher"
  },
  {
    quote: "Having not explored breathwork before, I wasn’t sure what to expect, but I had a wonderful breathwork experience with Rosalind, who held space for our session with such warmth and kindness. I immediately felt safe, and Rosalind guided the session calmly, gently and without judgement, providing a safe landing and decompression period at the end. I’d thoroughly recommend Rosalind - definitely a ‘no notes’ experience!",
    name: "Ru Briant",
    role: "Screenwriter"
  },
  {
    quote: "My Neurodynamic session with Rosalind was a deeply powerful and heart-opening experience. From the very beginning, I felt safe, held, and guided with such kindness and care. Through her way of holding space, I was able to move through intense physical sensations and emotions — fear, anger, release — and come out the other side with a profound sense of empowerment, relief, and love. It felt like my body was finally allowed to let go of things it had been carrying for a long time. Rosalind has a rare gift. Her presence is gentle yet strong, and you can truly feel the love, integrity, and authenticity she brings into her work. I left the session feeling lighter, clearer, and deeply connected to myself and to life. What she offers is something truly special, and I believe her work will touch and support many people in a meaningful way.”",
    name: "Vika Urbano",
    role: "Manager"
  },
  {
    quote: "Rosalind orchestrated our time together so beautifully, with care and compassion. She made me feel at ease, safe and secure as she carefully and with love explained what the breathwork session would entail. She has the tone of an air hostess that makes one feel it’s not only safe but also fun to fly! Very comforting and trustworthy. I would recommend to anyone wanting to delve into the liberating world of breathing with all the extensive benefits - Rosalind is a safe pair of hands.",
    name: "Hannah Cavaghan",
    role: "Writer"
  },
  {
    quote: "I had a breathwork session with Rosalind today and it was genuinely outstanding. I went in not quite knowing what to expect, but within a very short time I was able to relax deeply and reach a place of calm that felt quite profound almost a spiritual experience, and certainly one I hadn’t anticipated. She explained clearly at the beginning how the session would work, what to expect, and how to lean into the process. After that, she stepped back and allowed the experience to unfold naturally, holding the space quietly while I focused on my breathing. The combination of breathwork and carefully chosen music made it easy to let go, settle into meditation, and reach a state of deep relaxation. It felt like an hour exceptionally well spent and it had a meaningful impact on me. I particularly appreciated how safe and supported the session felt. I would very much like to continue this work and I cannot recommend her highly enough.",
    name: "Corinna Rae",
    role: "Life Coach"
  },
  {
    quote: "I came to my breathwork session bearing a lot emotionally, mentally and physically. Rosalind meets you where you are with an open mind and open heart. What she creates, without making a performance of it, is a sense of safety. Enough to genuinely submit to the experience rather than observe it. For me, finding alignment in that session with my body and breath was a form of rescue and release that I sorely needed. This is a feeling that comes rarely in contemporary life and Rosalind has a gift, and a true care, for making this possible.",
    name: "Thomas Clapham",
    role: "Screenwriter"
  },
  {
    quote: "I had a truly wonderful experience during my breathwork session with Rosalind. From the very beginning, she created a safe and supportive space that allowed me to fully relax and explore the process with trust and openness. I was able to discover things within myself that I hadn’t been aware of before. It was a very interesting and insightful journey inward. The breathwork helped me connect more deeply with my inner world and brought up a sense of clarity and understanding that I’m very grateful for. After the session, I felt a deep sense of calm, balance and overall wellbeing. It left me with the feeling that this is a powerful practice that supports not only physical health, but also mental and emotional wellbeing. A thousand thanks to Rosalind for developing and sharing her gift with others. Her guidance and presence made the whole experience truly special. I highly recommend this practice to anyone looking to reconnect with themselves and cultivate greater health and harmony in their life.",
    name: "Almudena Angoso",
    role: "Artist"
  }
];

export default function TestimonialsPage() {
  return (
    <div className="flex flex-col w-full bg-background pb-24">
      {/* HEADER SECTION */}
      <section className="py-24 text-center">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <span className="text-foreground/50 uppercase tracking-[0.2em] text-sm font-semibold mb-8 block">
            Testimonials
          </span>
          <h1 className="text-3xl md:text-5xl font-heading mb-6 leading-tight text-primary italic font-light px-4 md:px-12">
            “And the time came when the risk to remain tight in a bud was more painful than the risk it took to blossom.”
          </h1>
          <p className="text-lg font-light text-foreground/70 italic mt-8">
            Anaïs Nin
          </p>
        </div>
      </section>

      {/* TESTIMONIALS GRID */}
      <section className="container mx-auto px-6 md:px-12 max-w-7xl">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8">
          {TESTIMONIALS.map((testimonial, idx) => (
            <div 
              key={idx} 
              className="break-inside-avoid mb-8 bg-card rounded-2xl p-8 md:p-10 shadow-sm border border-border/50 hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-foreground/80 font-light text-[15px] leading-relaxed mb-8">
                &quot;{testimonial.quote}&quot;
              </p>
              <div>
                <p className="font-medium text-primary text-sm tracking-wide">
                  {testimonial.name}
                </p>
                {testimonial.role && (
                  <p className="text-xs text-foreground/50 mt-1 uppercase tracking-wider">
                    {testimonial.role}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
