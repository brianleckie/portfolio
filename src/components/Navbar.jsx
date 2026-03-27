import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'

export default function Navbar() {
  const { lang, t, toggle } = useLanguage()

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

        <div className="flex items-center gap-6">
          <a
            href="#projects"
            className="text-foreground-muted text-sm hover:text-foreground transition-colors duration-200"
          >
            {t.nav.projects}
          </a>
          <a
            href="#contact"
            className="text-foreground-muted text-sm hover:text-foreground transition-colors duration-200"
          >
            {t.nav.contact}
          </a>

          {/* Language toggle */}
          <button
            onClick={toggle}
            className="flex items-center gap-1 text-xs border border-border rounded px-2 py-1 hover:border-subtle transition-colors duration-200"
            aria-label="Toggle language"
          >
            <span className={lang === 'es' ? 'text-foreground font-medium' : 'text-muted'}>ES</span>
            <span className="text-border select-none">|</span>
            <span className={lang === 'en' ? 'text-foreground font-medium' : 'text-muted'}>EN</span>
          </button>
        </div>
      </div>
    </motion.nav>
  )
}
