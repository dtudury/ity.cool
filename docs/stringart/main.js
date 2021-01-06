/* eslint-env browser */
import { render, h, proxy, watchFunction, mapEntries } from './horseless.0.5.1.min.esm.js'
const model = window.model = proxy(localStorage.getItem('model') ? JSON.parse(localStorage.getItem('model')) : {
  points: [],
  steps: 1,
  curviness: 0.5
})
watchFunction(() => { localStorage.setItem('model', JSON.stringify(model)) })

const p2xy = p => `${p.x} ${p.y}`

const line = (a, b, attributes) => h`<path d="M${() => p2xy(a)}L${() => p2xy(b)}" ${attributes}/>`

const lines = el => {
  const lines = []
  model.points.forEach((a, i) => {
    const b = model.points[(i + 1) % model.points.length]
    lines.push(line(a, b, { stroke: 'white', fill: 'none' }))
  })
  return lines
}
const stringart = el => {
  const lines = []
  model.points.forEach((a, i) => {
    const b = model.points[(i + 1) % model.points.length]
    const c = model.points[(i + 2) % model.points.length]
    const u = model.curviness
    const v = 1 - u
    const ab = { x: a.x * u + b.x * v, y: a.y * u + b.y * v }
    const bc = { x: c.x * u + b.x * v, y: c.y * u + b.y * v }
    for (let i = 0; i <= model.steps; ++i) {
      const t = i / model.steps
      const r = 1 - t
      const abb = { x: ab.x * t + b.x * r, y: ab.y * t + b.y * r }
      const bbc = { x: b.x * t + bc.x * r, y: b.y * t + bc.y * r }
      lines.push(line(abb, bbc, { stroke: '#00000020', fill: 'none' }))
    }
  })
  return lines
}

const circle = (p, attributes, ongrab, onclick) => h`<circle cx="${() => p.x}" cy="${() => p.y}" onmousedown=${ongrab} onclick=${onclick} ${attributes}/>`
const draggableCircle = (p, attributes = { r: 5 }) => {
  attributes.cursor = 'crosshair'
  const onclick = el => e => e.stopPropagation()
  const ongrab = el => e => {
    const ondrag = e => Object.assign(p, { x: e.x, y: e.y })
    const onrelease = e => {
      Object.entries(handlers).forEach(([name, handler]) => document.body.removeEventListener(name, handler))
    }
    const handlers = { mousemove: ondrag, mouseup: onrelease, mouseleave: onrelease, onclick }
    Object.entries(handlers).forEach(([name, handler]) => document.body.addEventListener(name, handler))
  }
  return circle(p, attributes, ongrab, onclick)
}

const stepsChange = el => e => { model.steps = +el.value }
const curvinessChange = el => e => { model.curviness = +el.value }
const addPoint = el => e => model.points.push({ x: e.x, y: e.y })

render(document.body, h`
  <svg width="100vw" height="100vh" onclick=${addPoint} style="display: block; background: oldlace;" xmlns="http://www.w3.org/2000/svg">
    ${lines}
    ${stringart}
    ${mapEntries(model.points, point => draggableCircle(point, { r: 12, fill: 'none', stroke: 'green', 'pointer-events': 'all' }))}
  </svg>
  <details style="            
    position: fixed;
    top: 0;
    left: 0;
    padding: 5px 20px;
    background: #ffffffdd;
    border-bottom-right-radius: 5px;
    border: 1px solid #00000044;
    border-left: none;
    border-top: none;
    user-select: none;
  ">
    <summary style="outline: none;">settings</summary>
    <div>
      <label for="steps">Steps</label>
      <input type="range" oninput=${stepsChange} name="steps" value="${() => model.steps}" min="1" max="100">
      ${() => model.steps}
    </div>
    <div>
      <label for="curviness">Curviness</label>
      <input type="range" oninput=${curvinessChange} name="curviness" value="${() => model.curviness}" min="0" max="1" step="0.01">
      ${() => model.curviness}
    </div>
  </details>
`)
