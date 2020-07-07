import { h, render, proxy, mapEntries } from './horseless.0.5.1.min.esm.js' // '/unpkg/horseless/horseless.js'

const model = window.model = proxy({
  height: window.innerHeight,
  width: window.innerWidth,
  count: 15,
  x: 0,
  y: 0,
  t: 0,
  positions: [],
  velocities: [],
  targets: []
})
function rPoint (point) {
  let p = point.slice(0, 3)
  let r2
  do {
    p = p.map(() => 2 * Math.random() - 1)
  } while ((r2 = p.reduce((a, v) => a + v * v, 0)) > 1)
  const r = Math.sqrt(r2) / (300 + Math.random() * 100)
  p = p.map(v => v / r)
  p[3] = 5 + Math.random() * 15
  if (Math.random() < 1 / 3) {
    // #E14B8A
    p[4] = 0xE1
    p[5] = 0x4B
    p[6] = 0x8A
  } else if (Math.random() < 1 / 2) {
    // #54C7D3
    p[4] = 0x54
    p[5] = 0xC7
    p[6] = 0xD3
  } else {
    // #999999
    p[4] = 0x99
    p[5] = 0x99
    p[6] = 0x99
  }
  return Object.assign(point, p)
}
for (let i = 0; i < model.count; i++) {
  model.positions.push([0, 0, 0, 0, 0x99, 0x99, 0x99])
  model.velocities.push([0, 0, 0, 0, 0, 0, 0])
  model.targets.push(rPoint([0, 0, 0, 0, 0, 0, 0]))
}
window.addEventListener('resize', e => {
  model.height = window.innerHeight
  model.width = window.innerWidth
})
window.addEventListener('mousemove', e => {
  const dx = (model.x - e.x) * 0.003
  const dy = (model.y - e.y) * 0.003
  for (let i = 0; i < model.count; i++) {
    const target = model.targets[i]
    const x = target[0]
    const y = target[1]
    let z = target[2]
    target[0] = x * Math.cos(dx) - z * Math.sin(dx)
    target[2] = x * Math.sin(dx) + z * Math.cos(dx)
    z = target[2]
    target[1] = y * Math.cos(dy) - z * Math.sin(dy)
    target[2] = y * Math.sin(dy) + z * Math.cos(dy)
  }
  model.x = e.x
  model.y = e.y
})
setInterval(() => {
  model.targets.forEach(rPoint)
}, 6000)

function enterFrame (t) {
  for (let i = 0; i < model.count; i++) {
    const position = model.positions[i]
    const velocity = model.velocities[i]
    const target = model.targets[i]
    for (let j = 0; j < position.length; j++) {
      velocity[j] = (velocity[j] + (target[j] - position[j]) * 0.01) * 0.7
      position[j] += velocity[j]
    }
  }
  model.t = t
  window.requestAnimationFrame(enterFrame)
}
enterFrame()

function project (v, z) {
  return v * 300 / (500 + z)
}

function mapLines (p) {
  return h`
    <line 
      x1="0"
      y1="0"
      x2="${() => project(p[0], p[2])}px" 
      y2="${() => project(p[1], p[2])}px" 
    />
  `
}

function mapCircles (p) {
  return h`
    <circle 
      fill="rgb(${() => p[4]},${() => p[5]},${() => p[6]})"
      cx="${() => project(p[0], p[2])}px" 
      cy="${() => project(p[1], p[2])}px" 
      r="${() => project(p[3], p[2])}px"
    />
  `
}

render(document.body, h`
  <svg width="100vw" height="100vh" xmlns="http://www.w3.org/2000/svg">
    <g transform = "translate(${() => model.width / 2} ${() => model.height / 2})">
      ${mapEntries(model.positions, mapLines)}
      <circle fill="#99999910" cx="0" cy="0" r="150px"/>
      <circle fill="#99999940" cx="0" cy="0" r="50px"/>
      <circle fill="#54C7D3" cx="0" cy="0" r="20px"/>
      ${mapEntries(model.positions, mapCircles)}
    </g>
  </svg>
`)
