import { motion } from 'framer-motion'

export default function Navbar() {
  return (
    <motion.nav
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="max-w-content mx-auto px-6 flex justify-between items-center h-16">
        <a
          href="#"
          className="text-foreground font-semibold tracking-tight text-sm hover:text-foreground/80 transition-colors duration-200"
        >
          Brian Leckie
        </a>
        <div className="flex items-center gap-8">
          <a
            href="#projects"
            className="text-foreground-muted text-sm hover:text-foreground transition-colors duration-200"
          >
            Projects
          </a>
          <a
            href="#contact"
            className="text-foreground-muted text-sm hover:text-foreground transition-colors duration-200"
          >
            Contact
          </a>
        </div>
      </div>
    </motion.nav>
  )
}
