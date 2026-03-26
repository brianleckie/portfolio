import SectionTitle from './SectionTitle'
import ProjectCard from './ProjectCard'

const projects = [
  {
    title:       'Mbarete SaaS',
    description:
      'Comprehensive Gym Management & Automation System — from membership tracking and billing automation to class scheduling and real-time attendance reporting.',
    role:        'Founder & Lead Developer',
    tags:        ['React', 'FastAPI', 'PostgreSQL', 'Python'],
  },
  {
    title:       'Estación Carretera',
    description:
      'B2B/C2C Marketplace for Public Sector Artisans — connecting artisans with buyers through a structured marketplace with vendor dashboards and order management.',
    role:        'Project Lead',
    tags:        ['React', 'Python', 'REST API', 'PostgreSQL'],
  },
  {
    title:       'Mercado Jopoi',
    description:
      'C2C Marketplace with Real-time Data Processing — featuring live inventory updates, real-time chat, and a dynamic product feed powered by WebSockets.',
    role:        'Full-stack Developer',
    tags:        ['React', 'FastAPI', 'WebSockets', 'Python'],
  },
]

export default function Projects() {
  return (
    <section id="projects" className="max-w-content mx-auto px-6 py-24 md:py-32">
      <div className="mb-14">
        <SectionTitle
          label="Selected Work"
          title="Featured Projects"
          description="Products built from zero to production — end-to-end architecture, design, and delivery."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project, i) => (
          <div
            key={project.title}
            className={i === projects.length - 1 ? 'md:col-span-2 md:max-w-xl' : ''}
          >
            <ProjectCard {...project} index={i} />
          </div>
        ))}
      </div>
    </section>
  )
}
