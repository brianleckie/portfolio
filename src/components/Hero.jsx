import { motion } from 'framer-motion'

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden:   { opacity: 0, y: 20 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const stack = ['React', 'Python', 'FastAPI', 'PostgreSQL']

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-16 overflow-hidden">
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,255,255,0.05) 0%, transparent 100%)',
        }}
      />

      <div className="relative max-w-content mx-auto px-6 py-24 md:py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-8"
        >
          {/* Eyebrow */}
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted font-medium">
              <span className="inline-block w-4 h-px bg-muted" />
              Full-Stack Software Engineer
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-display font-semibold text-foreground gradient-text max-w-4xl"
          >
            Building Scalable Digital Systems for Business Growth
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-subhead text-foreground-muted max-w-xl leading-relaxed"
          >
            I design and ship full-stack products end-to-end — from pixel-perfect
            React interfaces to robust Python/FastAPI backends — built to scale,
            automate, and perform.
          </motion.p>

          {/* Stack badges */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
            {stack.map((tech) => (
              <span
                key={tech}
                className="bg-surface border border-border text-foreground-muted text-xs px-3 py-1 rounded-full"
              >
                {tech}
              </span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-2">
            <a href="#projects" className="btn-primary">
              View Projects
            </a>
            <a href="#contact" className="btn-ghost">
              Get in Touch
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom divider */}
      <div className="divider" />
    </section>
  )
}
