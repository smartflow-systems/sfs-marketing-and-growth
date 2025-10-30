import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Pricing from './pages/Pricing'
import UTMBuilder from './pages/tools/UTMBuilder'
import LinkInBio from './pages/tools/LinkInBio'
import AIPostGenerator from './pages/tools/AIPostGenerator'
import CampaignCalendar from './pages/tools/CampaignCalendar'
import OGImageGenerator from './pages/tools/OGImageGenerator'
import Dashboard from './pages/Dashboard'
import Success from './pages/Success'
import { initCircuitBackground } from './effects/circuit-background'

function App() {
  useEffect(() => {
    // Initialize circuit background animation
    initCircuitBackground()
  }, [])

  return (
    <>
      <canvas id="circuit-canvas"></canvas>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="success" element={<Success />} />

          {/* Growth Tools */}
          <Route path="tools">
            <Route path="utm-builder" element={<UTMBuilder />} />
            <Route path="link-in-bio" element={<LinkInBio />} />
            <Route path="ai-post-generator" element={<AIPostGenerator />} />
            <Route path="campaign-calendar" element={<CampaignCalendar />} />
            <Route path="og-image-generator" element={<OGImageGenerator />} />
          </Route>
        </Route>
      </Routes>
    </>
  )
}

export default App
