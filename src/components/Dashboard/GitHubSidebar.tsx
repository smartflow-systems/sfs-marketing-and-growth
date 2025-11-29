import { useState, useEffect } from 'react'
import { X, Menu, Home, Zap, DollarSign, LayoutDashboard, TrendingUp, Map } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function GitHubSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const menuItems = [
    {
      label: 'Home',
      path: '/',
      icon: Home,
      description: 'Back to landing page'
    },
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      description: 'Your workspace'
    },
    {
      label: 'Analytics',
      path: '/analytics',
      icon: TrendingUp,
      description: 'View metrics'
    },
    {
      label: 'Customer Journey',
      path: '/customer-journey',
      icon: Map,
      description: 'Funnel analysis'
    },
    {
      label: 'Pricing',
      path: '/pricing',
      icon: DollarSign,
      description: 'View plans'
    },
  ]

  const toolsSubmenu = [
    { label: 'UTM Builder', path: '/tools/utm-builder' },
    { label: 'Link-in-Bio', path: '/tools/link-in-bio' },
    { label: 'AI Post Generator', path: '/tools/ai-post-generator' },
    { label: 'Email Campaigns', path: '/tools/email-campaigns' },
    { label: 'Campaign Calendar', path: '/tools/campaign-calendar' },
    { label: 'OG Image Generator', path: '/tools/og-image-generator' },
    { label: 'SEO Toolkit', path: '/tools/seo' },
    { label: 'A/B Testing', path: '/tools/ab-testing' },
  ]

  const handleNavigation = (path: string) => {
    navigate(path)
    setIsOpen(false)
  }

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-5 left-5 z-50 p-2.5 bg-[#0D0D0D] rounded hover:bg-[#3B2F2F] transition-colors shadow-lg"
        aria-label="Toggle Menu"
      >
        <Menu className="w-6 h-6 text-[#FFD700]" />
      </button>

      {/* Overlay */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/70 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      />

      {/* Sidebar */}
      <nav
        className={`fixed top-0 left-0 h-screen w-[320px] bg-[#0D0D0D] text-[#F5F5DC] z-50 flex flex-col overflow-y-auto transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-[#FFD700] hover:text-[#E6C200] transition-colors"
          aria-label="Close Menu"
        >
          <X className="w-8 h-8" />
        </button>

        {/* Header */}
        <div className="pt-16 px-5 pb-5 border-b border-[#3B2F2F]">
          <h2 className="text-[#FFD700] text-xl font-semibold">
            SmartFlow Systems
          </h2>
          <p className="text-[#F5F5DC]/60 text-sm mt-1">Marketing & Growth Platform</p>
        </div>

        {/* Main Menu Items */}
        <ul className="py-5">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.label}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className="w-full flex items-center gap-3 py-4 px-5 text-[#F5F5DC] hover:bg-[#3B2F2F] hover:pl-7 border-l-[3px] border-transparent hover:border-[#FFD700] transition-all duration-200"
                >
                  <Icon className="w-5 h-5 text-[#FFD700]" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-[#F5F5DC]/50">{item.description}</div>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>

        {/* Tools Section */}
        <div className="px-5 py-3 border-t border-[#3B2F2F]">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-[#FFD700]" />
            <h3 className="text-[#FFD700] text-sm font-semibold uppercase tracking-wider">
              Growth Tools
            </h3>
          </div>
          <ul className="space-y-1">
            {toolsSubmenu.map((tool) => (
              <li key={tool.label}>
                <button
                  onClick={() => handleNavigation(tool.path)}
                  className="w-full text-left py-2 px-3 text-sm text-[#F5F5DC]/80 hover:text-[#F5F5DC] hover:bg-[#3B2F2F]/50 rounded transition-all duration-200"
                >
                  {tool.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer CTA */}
        <div className="p-5 border-t border-[#3B2F2F] mt-auto">
          <button
            onClick={() => handleNavigation('/pricing')}
            className="block w-full py-3 px-4 bg-[#FFD700] text-[#0D0D0D] text-center font-semibold rounded hover:bg-[#E6C200] transition-colors"
          >
            Get Started
          </button>
          <div className="mt-3 flex justify-center gap-4 text-xs text-[#F5F5DC]/50">
            <button
              onClick={() => handleNavigation('/')}
              className="hover:text-[#FFD700] transition-colors"
            >
              Support
            </button>
            <span>•</span>
            <button
              onClick={() => handleNavigation('/')}
              className="hover:text-[#FFD700] transition-colors"
            >
              Docs
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
