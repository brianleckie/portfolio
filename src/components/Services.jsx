import { motion } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'
import SectionTitle from './SectionTitle'

const icons = [
  // Frontend
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="3" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6 8L8.5 10.5L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.5 13H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>,
  // Backend
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2L2 6V10C2 14.4 5.4 18.5 10 19.5C14.6 18.5 18 14.4 18 10V6L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M7 10L9 12L13 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>,
  // Optimization
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 6V10L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 4L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M14 4L16 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>,
]

export default function Services() {
  const { t } = useLanguage()
  const { label, title, description, items } = t.services

  return (
    <section className="py-24 md:py-32 border-t border-border">
      <div className="max-w-content mx-auto px-6 mb-14">
        <SectionTitle label={label} title={title} description={description} />
      </div>

      <div className="max-w-content mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border rounded-lg overflow-hidden">
          {items.map((service, i) => (
            <motion.div
              key={service.title}
              className="bg-background p-8 flex flex-col gap-4"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
            >
              <div className="text-foreground-muted">{icons[i]}</div>
              <h3 className="text-foreground font-semibold text-sm tracking-tight">
                {service.title}
              </h3>
              <p className="text-foreground-muted text-sm leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
