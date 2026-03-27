import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'

const socials = [
  { label: 'WhatsApp', href: 'https://wa.me/595983763890' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/brianleckie' },
  { label: 'GitHub',   href: 'https://github.com/brianleckie' },
]

export default function Footer() {
  const { t } = useLanguage()
  const { eyebrow, headline, cta, copyright } = t.footer

  return (
    <footer id="contact" className="border-t border-border">
      {/* CTA block */}
      <motion.div
        className="max-w-content mx-auto px-6 py-24 md:py-32 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <p className="text-xs uppercase tracking-widest text-muted mb-6">
          {eyebrow}
        </p>
        <h2 className="text-heading font-semibold text-foreground mb-10 max-w-xl mx-auto">
          {headline}
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="mailto:brian@brianleckie.dev" className="btn-primary">
            {cta}
          </a>
          {socials.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              {label}
            </a>
          ))}
        </div>
      </motion.div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="max-w-content mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span className="text-xs text-muted">Brian Leckie</span>
          <span className="text-xs text-muted">
            © {new Date().getFullYear()} — {copyright}
          </span>
        </div>
      </div>
    </footer>
  )
}
