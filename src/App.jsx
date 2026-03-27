import { LanguageProvider } from './context/LanguageContext'
import Navbar   from './components/Navbar'
import Hero     from './components/Hero'
import Projects from './components/Projects'
import Services from './components/Services'
import Footer   from './components/Footer'

export default function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main>
          <Hero />
          <Projects />
          <Services />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  )
}
