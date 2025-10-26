
// SmartFlow Circuit Background Animation
(function() {
  const canvas = document.createElement('canvas');
  canvas.id = 'circuit-canvas';
  document.body.insertBefore(canvas, document.body.firstChild);
  
  const ctx = canvas.getContext('2d');
  let width, height;
  
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  
  resize();
  window.addEventListener('resize', resize);
  
  // Circuit lines
  const lines = [];
  const lineCount = 60;
  
  for (let i = 0; i < lineCount; i++) {
    lines.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      length: Math.random() * 100 + 50
    });
  }
  
  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw circuit lines
    ctx.strokeStyle = 'rgba(230, 194, 0, 0.28)';
    ctx.lineWidth = 1;
    
    lines.forEach(line => {
      // Update position
      line.x += line.vx;
      line.y += line.vy;
      
      // Bounce off edges
      if (line.x < 0 || line.x > width) line.vx *= -1;
      if (line.y < 0 || line.y > height) line.vy *= -1;
      
      // Draw line
      ctx.beginPath();
      ctx.moveTo(line.x, line.y);
      ctx.lineTo(line.x + line.length, line.y);
      ctx.stroke();
    });
    
    requestAnimationFrame(animate);
  }
  
  animate();
})();
