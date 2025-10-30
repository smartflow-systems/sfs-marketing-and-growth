// Circuit board animation for background
export function initCircuitBackground() {
  const canvas = document.getElementById('circuit-canvas') as HTMLCanvasElement
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Set canvas size
  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)

  // Circuit nodes
  interface Node {
    x: number
    y: number
    vx: number
    vy: number
  }

  const nodes: Node[] = []
  const nodeCount = 50
  const connectionDistance = 150
  const goldAlpha = 0.15

  // Initialize nodes
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    })
  }

  // Animation loop
  function animate() {
    if (!ctx || !canvas) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Update and draw nodes
    nodes.forEach((node, i) => {
      // Move node
      node.x += node.vx
      node.y += node.vy

      // Bounce off edges
      if (node.x < 0 || node.x > canvas.width) node.vx *= -1
      if (node.y < 0 || node.y > canvas.height) node.vy *= -1

      // Draw connections
      for (let j = i + 1; j < nodes.length; j++) {
        const other = nodes[j]
        const dx = other.x - node.x
        const dy = other.y - node.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < connectionDistance) {
          const opacity = (1 - distance / connectionDistance) * goldAlpha
          ctx.strokeStyle = `rgba(255, 215, 0, ${opacity})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(other.x, other.y)
          ctx.stroke()
        }
      }

      // Draw node
      ctx.fillStyle = `rgba(255, 215, 0, ${goldAlpha * 2})`
      ctx.beginPath()
      ctx.arc(node.x, node.y, 2, 0, Math.PI * 2)
      ctx.fill()
    })

    requestAnimationFrame(animate)
  }

  animate()
}
