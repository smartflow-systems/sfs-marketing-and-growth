// SmartFlow Premium - Flowing Stars Animation System
class SmartFlowStars {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        this.nodes = [];
        this.connections = [];
        this.pulses = [];
        this.stars = [];
        this.animationId = null;
        
        this.colors = {
            circuit: '#d4af37',
            circuitDim: 'rgba(212, 175, 55, 0.6)',
            pulse: '#ffdd00',
            node: '#d4af37',
            star: '#ffdd00'
        };
        
        this.init();
    }
    
    init() {
        if (window.innerWidth <= 768) return; // Skip on mobile
        this.createCanvas();
        this.setupEventListeners();
        this.generateCircuitBoard();
        this.generateStars();
        this.animate();
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'sf-canvas-container';
        document.body.appendChild(this.canvas);
        
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
        this.generateCircuitBoard();
    }
    
    generateCircuitBoard() {
        this.nodes = [];
        this.connections = [];
        this.pulses = [];
        
        const nodeCount = Math.floor((this.width * this.height) / 8000);
        
        for (let i = 0; i < nodeCount; i++) {
            this.nodes.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: 3 + Math.random() * 4,
                pulse: Math.random() * Math.PI * 2,
                energy: 0.5 + Math.random() * 0.5
            });
        }
        
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const dx = this.nodes[i].x - this.nodes[j].x;
                const dy = this.nodes[i].y - this.nodes[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150 && Math.random() < 0.5) {
                    this.connections.push({
                        start: i,
                        end: j,
                        opacity: 0.3 + Math.random() * 0.4
                    });
                }
            }
        }
    }
    
    generateStars() {
        this.stars = [];
        const starCount = 120;
        
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: 2 + Math.random() * 4,
                speed: 0.1 + Math.random() * 0.3,
                opacity: 0.3 + Math.random() * 0.7,
                twinkle: Math.random() * Math.PI * 2,
                direction: Math.random() * Math.PI * 2,
                drift: Math.random() * 0.02
            });
        }
    }
    
    updateStars() {
        this.stars.forEach(star => {
            star.x += Math.cos(star.direction) * star.speed * 0.3;
            star.y += Math.sin(star.direction) * star.speed * 0.3;
            star.direction += (Math.random() - 0.5) * star.drift;
            star.twinkle += 0.05;
            
            if (star.x < -10) star.x = this.width + 10;
            if (star.x > this.width + 10) star.x = -10;
            if (star.y < -10) star.y = this.height + 10;
            if (star.y > this.height + 10) star.y = -10;
        });
    }
    
    updatePulses() {
        if (Math.random() < 0.15 && this.connections.length > 0) {
            const connection = this.connections[Math.floor(Math.random() * this.connections.length)];
            const startNode = this.nodes[connection.start];
            const endNode = this.nodes[connection.end];
            
            this.pulses.push({
                startX: startNode.x,
                startY: startNode.y,
                endX: endNode.x,
                endY: endNode.y,
                progress: 0,
                speed: 0.008 + Math.random() * 0.012,
                size: 2 + Math.random() * 3,
                life: 1.0
            });
        }
        
        this.pulses = this.pulses.filter(pulse => {
            pulse.progress += pulse.speed;
            pulse.life = Math.max(0, pulse.life - 0.005);
            return pulse.progress < 1.0 && pulse.life > 0;
        });
    }
    
    render() {
        this.ctx.fillStyle = 'rgba(11, 11, 11, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw circuit connections
        this.connections.forEach(connection => {
            const startNode = this.nodes[connection.start];
            const endNode = this.nodes[connection.end];
            
            this.ctx.beginPath();
            this.ctx.moveTo(startNode.x, startNode.y);
            this.ctx.lineTo(endNode.x, endNode.y);
            this.ctx.strokeStyle = `rgba(212, 175, 55, ${connection.opacity})`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
        
        // Draw nodes
        this.nodes.forEach(node => {
            const pulseSize = node.radius + Math.sin(node.pulse) * 1;
            node.pulse += 0.02;
            
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2);
            this.ctx.fillStyle = this.colors.node;
            this.ctx.fill();
        });
        
        // Draw data pulses
        this.pulses.forEach(pulse => {
            const x = pulse.startX + (pulse.endX - pulse.startX) * pulse.progress;
            const y = pulse.startY + (pulse.endY - pulse.startY) * pulse.progress;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, pulse.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${pulse.life})`;
            this.ctx.fill();
        });
        
        // Draw flowing stars
        this.stars.forEach(star => {
            const twinkleOpacity = star.opacity * (0.5 + 0.5 * Math.sin(star.twinkle));
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(212, 175, 55, ${twinkleOpacity})`;
            this.ctx.fill();
            
            // Star glow
            const gradient = this.ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 6);
            gradient.addColorStop(0, `rgba(255, 221, 0, ${twinkleOpacity * 0.8})`);
            gradient.addColorStop(1, 'rgba(255, 221, 0, 0)');
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size * 6, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        });
    }
    
    animate() {
        this.updateStars();
        this.updatePulses();
        this.render();
        
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

// Auto-initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    if (window.innerWidth > 768) {
        window.smartFlowStars = new SmartFlowStars();
    }
});

// Handle page visibility
document.addEventListener('visibilitychange', () => {
    if (window.smartFlowStars) {
        if (document.hidden) {
            window.smartFlowStars.destroy();
        } else if (window.innerWidth > 768) {
            window.smartFlowStars = new SmartFlowStars();
        }
    }
});
