import { motion } from 'framer-motion'

export default function ProjectCard({ title, description, role, tags = [], href, index = 0 }) {
  return (
    <motion.article
      className="bg-surface border border-border rounded-lg p-6 flex flex-col gap-5 cursor-default"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      whileHover={{
        y: -4,
        boxShadow: '0 4px 24px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.08)',
        transition: { type: 'spring', stiffness: 400, damping: 25 },
      }}
    >
      {/* Top row */}
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-foreground font-semibold text-base leading-snug">
            {title}
          </h3>
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-muted hover:text-foreground transition-colors duration-200"
              aria-label={`View ${title}`}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 13L13 1M13 1H5M13 1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          )}
        </div>
        <span className="text-xs text-muted font-medium">{role}</span>
      </div>

      {/* Description */}
      <p className="text-foreground-muted text-sm leading-relaxed flex-1">
        {description}
      </p>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-background border border-border text-muted text-xs px-2.5 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.article>
  )
}
