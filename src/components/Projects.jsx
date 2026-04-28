import { useLanguage } from '../context/LanguageContext'
import SectionTitle from './SectionTitle'
import ProjectCard  from './ProjectCard'

export default function Projects() {
  const { t } = useLanguage()
  const { label, title, description, items } = t.projects

  return (
    <section id="projects" className="max-w-content mx-auto px-6 py-24 md:py-32">
      <div className="mb-14">
        <SectionTitle label={label} title={title} description={description} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((project, i) => (
          <ProjectCard key={project.title} {...project} index={i} />
        ))}
      </div>
    </section>
  )
}
