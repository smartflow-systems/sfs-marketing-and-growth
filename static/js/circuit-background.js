// SmartFlow Circuit Background Animation
// Flowing golden circuit paths with animated particles

class CircuitBackground {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = 0;
    this.height = 0;
    this.paths = [];
    this.particles = [];
    this.nodes = [];
    this.animationId = null;
    
    this.colors = {
      path: 'rgba(230, 194, 0, 0.28)',       // Gold paths
      pathGlow: 'rgba(255, 215, 0, 0.15)',   // Gold glow
      particle: '#FFD700',                    // Bright gold particles
      node: 'rgba(255, 215, 0, 0.6)',        // Gold nodes
      nodeGlow: 'rgba(255, 215, 0, 0.3)'     // Node glow
    };
    
    this.init();
  }
  
  init() {
    // Skip on mobile for performance
    if (window.innerWidth <= 768) return;
    
    this.createCanvas();
    this.setupEventListeners();
    this.generatePaths();
    this.generateNodes();
    this.generateParticles();
    this.animate();
  }
  
  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'circuit-canvas';
    document.body.insertBefore(this.canvas, document.body.firstChild);
    
    this.ctx = this.canvas.getContext('2d');
    this.resize();
  }
  
  setupEventListeners() {
    window.addEventListener('resize', () => this.resize());
  }
  
  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.generatePaths();
    this.generateNodes();
  }
  
  generatePaths() {
    this.paths = [];
    const pathCount = 12;
    
    for (let i = 0; i < pathCount; i++) {
      const startX = Math.random() * this.width;
      const startY = Math.random() * this.height;
      const endX = Math.random() * this.width;
      const endY = Math.random() * this.height;
      
      // Control points for Bezier curve
      const cp1x = startX + (Math.random() - 0.5) * this.width * 0.5;
      const cp1y = startY + (Math.random() - 0.5) * this.height * 0.5;
      const cp2x = endX + (Math.random() - 0.5) * this.width * 0.5;
      const cp2y = endY + (Math.random() - 0.5) * this.height * 0.5;
      
      this.paths.push({
        startX, startY,
        cp1x, cp1y,
        cp2x, cp2y,
        endX, endY,
        opacity: 0.3 + Math.random() * 0.4
      });
    }
  }
  
  generateNodes() {
    this.nodes = [];
    const nodeCount = 8;
    
    for (let i = 0; i < nodeCount; i++) {
      this.nodes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: 3 + Math.random() * 4,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03
      });
    }
  }
  
  generateParticles() {
    this.particles = [];
    const particleCount = 35;
    
    for (let i = 0; i < particleCount; i++) {
      const pathIndex = Math.floor(Math.random() * this.paths.length);
      this.particles.push({
        pathIndex: pathIndex,
        progress: Math.random(),
        speed: 0.001 + Math.random() * 0.002,
        size: 1 + Math.random() * 2,
        opacity: 0.4 + Math.random() * 0.6
      });
    }
  }
  
  drawPaths() {
    this.paths.forEach(path => {
      this.ctx.strokeStyle = this.colors.path;
      this.ctx.lineWidth = 1;
      this.ctx.globalAlpha = path.opacity;
      
      this.ctx.beginPath();
      this.ctx.moveTo(path.startX, path.startY);
      this.ctx.bezierCurveTo(
        path.cp1x, path.cp1y,
        path.cp2x, path.cp2y,
        path.endX, path.endY
      );
      this.ctx.stroke();
      
      // Glow effect
      this.ctx.strokeStyle = this.colors.pathGlow;
      this.ctx.lineWidth = 3;
      this.ctx.globalAlpha = path.opacity * 0.3;
      this.ctx.stroke();
    });
    
    this.ctx.globalAlpha = 1;
  }
  
  drawNodes() {
    this.nodes.forEach(node => {
      node.pulse += node.pulseSpeed;
      const pulseSize = Math.sin(node.pulse) * 2;
      
      // Glow
      const gradient = this.ctx.createRadialGradient(
        node.x, node.y, 0,
        node.x, node.y, node.radius + pulseSize + 8
      );
      gradient.addColorStop(0, this.colors.nodeGlow);
      gradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius + pulseSize + 8, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Node core
      this.ctx.fillStyle = this.colors.node;
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius + pulseSize, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }
  
  getBezierPoint(t, start, cp1, cp2, end) {
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    
    return mt3 * start + 3 * mt2 * t * cp1 + 3 * mt * t2 * cp2 + t3 * end;
  }
  
  drawParticles() {
    this.particles.forEach(particle => {
      const path = this.paths[particle.pathIndex];
      
      const x = this.getBezierPoint(
        particle.progress,
        path.startX, path.cp1x, path.cp2x, path.endX
      );
      const y = this.getBezierPoint(
        particle.progress,
        path.startY, path.cp1y, path.cp2y, path.endY
      );
      
      // Particle glow
      const gradient = this.ctx.createRadialGradient(
        x, y, 0,
        x, y, particle.size * 3
      );
      gradient.addColorStop(0, this.colors.particle);
      gradient.addColorStop(1, 'transparent');
      
      this.ctx.globalAlpha = particle.opacity * 0.5;
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(x, y, particle.size * 3, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Particle core
      this.ctx.globalAlpha = particle.opacity;
      this.ctx.fillStyle = this.colors.particle;
      this.ctx.beginPath();
      this.ctx.arc(x, y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Update progress
      particle.progress += particle.speed;
      if (particle.progress > 1) {
        particle.progress = 0;
        particle.pathIndex = Math.floor(Math.random() * this.paths.length);
      }
    });
    
    this.ctx.globalAlpha = 1;
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    this.drawPaths();
    this.drawNodes();
    this.drawParticles();
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth > 768) {
    new CircuitBackground();
  }
});
