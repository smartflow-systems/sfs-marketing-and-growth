// SmartFlow Premium - Initialization Script
// Import this script to initialize all visual effects

// Import effects if using ES modules
export { default as SmartFlowStars } from './effects/flowing-stars.js';
export { default as SmartFlowSparkles } from './effects/sparkles.js';

// Initialize all effects
export function initSmartFlowEffects() {
  // Effects auto-initialize via DOMContentLoaded events
  // This function can be used for manual initialization
  if (window.innerWidth > 768) {
    if (!window.smartFlowStars) {
      import('./effects/flowing-stars.js').then(() => {
        console.log('SmartFlow Stars initialized');
      });
    }
    
    if (!window.smartFlowSparkles) {
      import('./effects/sparkles.js').then(() => {
        console.log('SmartFlow Sparkles initialized');
      });
    }
  }
}

// Auto-initialize on import
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initSmartFlowEffects);
}
