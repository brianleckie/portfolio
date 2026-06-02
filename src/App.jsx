import { LanguageProvider } from './context/LanguageContext'
import Navbar    from './components/Navbar'
import Portfolio from './components/portfolio/Portfolio'

export default function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <Portfolio />
      </div>
    </LanguageProvider>
  )
}
