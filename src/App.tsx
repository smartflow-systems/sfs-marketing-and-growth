import { Routes, Route } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import Layout from './components/Layout'
import { initCircuitBackground } from './effects/circuit-background'

// OPTIMIZED: Lazy load pages for better initial load performance
const Landing = lazy(() => import('./pages/Landing'))
const Pricing = lazy(() => import('./pages/Pricing'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Success = lazy(() => import('./pages/Success'))

// OPTIMIZED: Lazy load tool pages (only loaded when visiting tools)
const UTMBuilder = lazy(() => import('./pages/tools/UTMBuilder'))
const LinkInBio = lazy(() => import('./pages/tools/LinkInBio'))
const AIPostGenerator = lazy(() => import('./pages/tools/AIPostGenerator'))
const EmailCampaignBuilder = lazy(() => import('./pages/tools/EmailCampaignBuilder'))
const CampaignCalendar = lazy(() => import('./pages/tools/CampaignCalendar'))
const OGImageGenerator = lazy(() => import('./pages/tools/OGImageGenerator'))
const SEOToolkit = lazy(() => import('./pages/tools/SEOToolkit'))

// Analytics & Admin
const Analytics = lazy(() => import('./pages/Analytics'))

// Loading fallback component
function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      color: '#FFD700'
    }}>
      <div className="spinner"></div>
    </div>
  )
}

function App() {
  useEffect(() => {
    // Initialize circuit background animation with cleanup
    const cleanup = initCircuitBackground()
    return cleanup // Cleanup when component unmounts
  }, [])

  return (
    <>
      <canvas id="circuit-canvas"></canvas>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="success" element={<Success />} />

            {/* Analytics */}
            <Route path="analytics" element={<Analytics />} />

            {/* Growth Tools */}
            <Route path="tools">
              <Route path="utm-builder" element={<UTMBuilder />} />
              <Route path="link-in-bio" element={<LinkInBio />} />
              <Route path="ai-post-generator" element={<AIPostGenerator />} />
              <Route path="email-campaigns" element={<EmailCampaignBuilder />} />
              <Route path="campaign-calendar" element={<CampaignCalendar />} />
              <Route path="og-image-generator" element={<OGImageGenerator />} />
              <Route path="seo" element={<SEOToolkit />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}

export default App
