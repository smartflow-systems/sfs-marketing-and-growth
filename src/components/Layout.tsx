import { Outlet, Link, useLocation } from 'react-router-dom'
import { Menu, X, Zap } from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Home', path: '/' },
  { name: 'Tools', path: '/dashboard' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Analytics', path: '/analytics' },
]

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="navbar">
        <div className="container">
          <Link to="/" className="navbar-brand">
            <div className="navbar-logo">
              <Zap size={24} />
            </div>
            <span className="text-gold-gradient">SmartFlow Growth</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <ul className="navbar-nav">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={isActive(item.path) ? 'text-gold' : ''}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/pricing" className="btn btn-gold pulse-on-hover">
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden btn btn-ghost"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="container" style={{ paddingTop: '6rem' }}>
          <nav className="flex flex-col gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="text-2xl font-semibold"
                style={{ color: isActive(item.path) ? 'var(--sf-gold)' : 'white' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/pricing"
              className="btn btn-gold mt-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ marginTop: '5rem', flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer>
        <div className="container">
          <p>
            © {new Date().getFullYear()} <span className="text-gold">SmartFlow Systems</span>
            {' '}— Premium Growth Tools for Modern Businesses
          </p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem', justifyContent: 'center', fontSize: '0.875rem' }}>
            <a href="#" style={{ color: 'var(--sf-muted)' }}>Privacy</a>
            <a href="#" style={{ color: 'var(--sf-muted)' }}>Terms</a>
            <a href="#" style={{ color: 'var(--sf-muted)' }}>Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
