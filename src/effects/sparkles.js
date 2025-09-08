// SmartFlow Premium - Interactive Sparkles System
class SmartFlowSparkles {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        this.sparkles = [];
        this.mouseSparkles = [];
        this.animationId = null;
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.init();
    }
    
    init() {
        if (window.innerWidth <= 768) return; // Skip on mobile
        this.createCanvas();
        this.setupEventListeners();
        this.generateSparkles();
        this.animate();
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'sf-sparkles-canvas';
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('click', (e) => this.onMouseClick(e));
    }
    
    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }
    
    generateSparkles() {
        this.sparkles = [];
        const sparkleCount = 40;
        
        for (let i = 0; i < sparkleCount; i++) {
            this.sparkles.push(this.createSparkle(
                Math.random() * this.width,
                Math.random() * this.height
            ));
        }
    }
    
    createSparkle(x, y, intense = false) {
        return {
            x: x,
            y: y,
            size: intense ? 3 + Math.random() * 6 : 1 + Math.random() * 3,
            opacity: intense ? 0.8 + Math.random() * 0.2 : 0.4 + Math.random() * 0.6,
            twinkle: Math.random() * Math.PI * 2,
            life: intense ? 2.0 : 1.0,
            maxLife: intense ? 2.0 : 1.0,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            rays: intense ? 4 + Math.floor(Math.random() * 4) : 0
        };
    }
    
    onMouseMove(e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        
        if (Math.random() < 0.3) {
            this.mouseSparkles.push(this.createSparkle(
                e.clientX + (Math.random() - 0.5) * 40,
                e.clientY + (Math.random() - 0.5) * 40
            ));
        }
    }
    
    onMouseClick(e) {
        // Create burst of sparkles on click
        for (let i = 0; i < 12; i++) {
            this.mouseSparkles.push(this.createSparkle(
                e.clientX + (Math.random() - 0.5) * 60,
                e.clientY + (Math.random() - 0.5) * 60,
                true
            ));
        }
    }
    
    updateSparkles() {
        // Update background sparkles
        this.sparkles.forEach(sparkle => {
            sparkle.twinkle += 0.08;
            sparkle.x += sparkle.vx * 0.5;
            sparkle.y += sparkle.vy * 0.5;
            
            if (sparkle.x < 0) sparkle.x = this.width;
            if (sparkle.x > this.width) sparkle.x = 0;
            if (sparkle.y < 0) sparkle.y = this.height;
            if (sparkle.y > this.height) sparkle.y = 0;
        });
        
        // Update mouse sparkles with lifetime
        this.mouseSparkles = this.mouseSparkles.filter(sparkle => {
            sparkle.twinkle += 0.15;
            sparkle.life -= 0.02;
            sparkle.x += sparkle.vx;
            sparkle.y += sparkle.vy;
            sparkle.vx *= 0.95;
            sparkle.vy *= 0.95;
            return sparkle.life > 0;
        });
    }
    
    drawSparkle(sparkle) {
        const twinkleOpacity = sparkle.opacity * (0.5 + 0.5 * Math.sin(sparkle.twinkle));
        const lifeRatio = sparkle.life / sparkle.maxLife;
        const finalOpacity = twinkleOpacity * lifeRatio;
        
        if (sparkle.rays > 0) {
            // Draw sparkle with rays
            this.ctx.save();
            this.ctx.translate(sparkle.x, sparkle.y);
            
            for (let i = 0; i < sparkle.rays; i++) {
                this.ctx.save();
                this.ctx.rotate((Math.PI * 2 * i) / sparkle.rays);
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(0, -sparkle.size * 3);
                this.ctx.strokeStyle = `rgba(255, 221, 0, ${finalOpacity})`;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                this.ctx.restore();
            }
            this.ctx.restore();
        }
        
        // Draw main sparkle
        this.ctx.beginPath();
        this.ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(212, 175, 55, ${finalOpacity})`;
        this.ctx.fill();
        
        // Glow effect
        const gradient = this.ctx.createRadialGradient(
            sparkle.x, sparkle.y, 0, 
            sparkle.x, sparkle.y, sparkle.size * 4
        );
        gradient.addColorStop(0, `rgba(255, 221, 0, ${finalOpacity * 0.6})`);
        gradient.addColorStop(1, 'rgba(255, 221, 0, 0)');
        
        this.ctx.beginPath();
        this.ctx.arc(sparkle.x, sparkle.y, sparkle.size * 4, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        [...this.sparkles, ...this.mouseSparkles].forEach(sparkle => {
            this.drawSparkle(sparkle);
        });
    }
    
    animate() {
        this.updateSparkles();
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
        window.smartFlowSparkles = new SmartFlowSparkles();
    }
});

// Handle page visibility
document.addEventListener('visibilitychange', () => {
    if (window.smartFlowSparkles) {
        if (document.hidden) {
            window.smartFlowSparkles.destroy();
        } else if (window.innerWidth > 768) {
            window.smartFlowSparkles = new SmartFlowSparkles();
        }
    }
});
