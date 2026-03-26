import { motion } from 'framer-motion'

const variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function SectionTitle({ label, title, description }) {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
    >
      <span className="text-xs uppercase tracking-widest text-muted font-medium">
        {label}
      </span>
      <h2 className="text-heading font-semibold mt-3 text-foreground">
        {title}
      </h2>
      {description && (
        <p className="text-foreground-muted text-subhead mt-4 max-w-lg">
          {description}
        </p>
      )}
    </motion.div>
  )
}
