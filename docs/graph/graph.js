const canvas = document.createElement('canvas')
canvas.style.display = 'block'
const context = canvas.getContext('2d')
let t0 = Date.now()
const points = []
const period = 2000
const waveLength = 200

let lastTealDots
let lastMagentaDots
let tealDots
let magentaDots
let tDotSwitch
function resetDots () {
  tDotSwitch = Date.now()
  lastTealDots = tealDots
  lastMagentaDots = magentaDots
  tealDots = []
  magentaDots = []
  for (let i = 1; i < 49; i++) {
    let line = Math.floor(Math.random() * 9)
    tealDots.push({ i, line })
    line = (line + Math.floor(Math.random() * 8) + 1) % 9
    magentaDots.push({ i, line })
  }
}
resetDots()
lastTealDots = tealDots
lastMagentaDots = magentaDots
setInterval(resetDots, 5000)

document.body.appendChild(canvas)
document.body.style.margin = 0
while (document.body.lastChild) {
  document.body.removeChild(document.body.lastChild)
}
document.body.appendChild(canvas)

let redrawing = false

function resizeCanvas () {
  canvas.width = window.innerWidth
  canvas.height = 200 //window.innerHeight
  redraw()
}
window.addEventListener('resize', resizeCanvas, false)
resizeCanvas()

function redraw () {
  if (redrawing) return
  redrawing = true
  window.requestAnimationFrame(() => {
    redrawing = false
    redraw()
  })
  context.fillStyle = '#08192d'
  context.fillRect(0, 0, canvas.width, canvas.height)
  let now = Date.now()
  let dt = (now - t0) / period
  while (dt > 1) {
    points.shift()
    t0 += period
    dt -= 1
  }
  const idt = 1 - dt
  while (points.length < 50) {
    points.push({ y: Math.random() * 2 * Math.PI, spread: Math.random() * 2 * Math.PI })
  }
  for (let i = 0; i < 9; i++) {
    drawCurve(i)
  }

  const dtots = 1 - Math.pow(1 - Math.min(1, (Date.now() - tDotSwitch) / 1000), 3)
  drawDots(tealDots, lastTealDots, dtots, '#296b7c')
  drawDots(magentaDots, lastMagentaDots, dtots, '#602553')


  function drawDots (dots, lastDots, dtots, color) {
    const mappedDots = dots.map((dot, i) => {
      const lastDot = lastDots[i]
      const line = dot.line * dtots + lastDot.line * (1 - dtots)
      return mapDot(dot.i, line)
    })
    context.beginPath()
    context.strokeStyle = color
    context.moveTo(mappedDots[0].x, mappedDots[0].y)
    for (let i = 0; i < mappedDots.length; i++) {
      context.lineTo(mappedDots[i].x, mappedDots[i].y)
    }
    context.stroke()
    for (let i = 0; i < mappedDots.length; i++) {
      context.beginPath()
      context.fillStyle = color
      context.arc(mappedDots[i].x, mappedDots[i].y, 5, 0, 2 * Math.PI)
      context.fill()
    }
  }

  function mapDot (i, line) {
    const y0 = mapY(points[i - 1], line)
    const y2 = mapY(points[i], line)
    const y4 = mapY(points[i + 1], line)
    const y1 = (y0 + y2) / 2
    const y3 = (y2 + y4) / 2
    const y = idt * idt * y1 + 2 * dt * idt * y2 + dt * dt * y3
    return { x: mapX(i + dt), y }
  }


  function drawCurve (line) {
    context.beginPath()
    let lastY = mapY(points[0], line)
    context.moveTo(mapX(0), lastY)
    for (let i = 1; i < points.length; i++) {
      let nextY = mapY(points[i], line)
      let y = (lastY + nextY) / 2
      context.quadraticCurveTo(
        mapX(i - 1 / 2), lastY,
        mapX(i), y
      )
      lastY = nextY
    }
    context.strokeStyle = '#ffffff10'
    context.stroke()
  }

  function mapX (i) {
    return -waveLength * (dt + 1) + waveLength * i
  }

  function mapY (point, line) {
    const spread = Math.sin(point.spread - now / 2000) * 3 + 7
    const y = (Math.sin(point.y - now / 3000) * 0.5 + 0.5) * (190 - spread * 8) + 5
    return y + line * spread
  }
}
