/* eslint-env browser */
import { render, h, proxy, showIfElse, watchFunction } from './horseless.0.5.1.min.esm.js'
const model = window.model = proxy(localStorage.getItem('model') ? JSON.parse(localStorage.getItem('model')) : {
  a: { x: 100, y: 100 },
  b: { x: 200, y: 100 },
  c: { x: 200, y: 200 },
  d: { x: 100, y: 200 },
  v: { x: 150, y: 150 },
  showingSpine: true,
  showingStringArt: false,
  steps: 32
})
watchFunction(() => { localStorage.setItem('model', JSON.stringify(model)) })

const circle = (p, attributes, ongrab) => h`<circle cx="${() => p.x}" cy="${() => p.y}" onmousedown=${ongrab} ${attributes}/>`
const draggableCircle = (p, attributes = { r: 5 }) => {
  const ongrab = el => e => {
    const ondrag = e => Object.assign(p, { x: e.x, y: e.y })
    const onrelease = e => Object.entries(handlers).forEach(([name, handler]) => document.body.removeEventListener(name, handler))
    const handlers = { mousemove: ondrag, mouseup: onrelease, mouseleave: onrelease }
    Object.entries(handlers).forEach(([name, handler]) => document.body.addEventListener(name, handler))
  }
  return circle(p, attributes, ongrab)
}
const coeffecients = [[], [1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1], [1, 5, 10, 10, 5, 1]]
const bezier = (values, t) => values.reduce((a, b, i) => {
  const weight = coeffecients[values.length][i] * Math.pow(t, i) * Math.pow(1 - t, values.length - i - 1)
  return a + b * weight
}, 0)
const bezierP = (points, t) => points.reduce((a, b, i) => {
  const weight = coeffecients[points.length][i] * Math.pow(t, i) * Math.pow(1 - t, points.length - i - 1)
  return { x: a.x + b.x * weight, y: a.y + b.y * weight }
}, { x: 0, y: 0 })

const distance = (a, b) => Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2))
const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y })
const sub = (a, b) => add(a, { x: -b.x, y: -b.y })
const scale = (a, v) => ({ x: a.x * v, y: a.y * v })
const dot = (a, b) => a.x * b.x + a.y * b.y
const rot = (a, angle) => {
  const s = Math.sin(angle)
  const c = Math.cos(angle)
  return {
    x: a.x * c - a.y * s,
    y: a.x * s + a.y * c
  }
}
const atan = a => Math.atan2(a.y, a.x)
const p2xy = p => `${p.x} ${p.y}`
const toSteps = (steps, f) => steps > 1 ? Array(steps).fill().map((_, i) => f(i / (steps - 1))) : null
const line = (a, b, attributes) => h`<path d="M${() => p2xy(a)}L${() => p2xy(b)}" ${attributes}/>`
const curve = (a, b, c, d, attributes) => h`<path d="M${() => p2xy(a)}C${() => p2xy(b)} ${() => p2xy(c)} ${() => p2xy(d)}" ${attributes}/>`
const stretchedCurve = (a, b, c, d, v, attributes) => el => {
  const av = Math.pow(distance(a, v), Math.SQRT2)
  const dv = Math.pow(distance(d, v), Math.SQRT2)
  const t = av / (av + dv)
  const ab = bezierP([a, b], t)
  const bc = bezierP([b, c], t)
  const cd = bezierP([c, d], t)
  const abbc = bezierP([ab, bc], t)
  const bccd = bezierP([bc, cd], t)
  const abbcbccd = bezierP([abbc, bccd], t)
  let dspin = atan(sub(v, d)) - atan(sub(abbcbccd, d))
  let aspin = atan(sub(v, a)) - atan(sub(abbcbccd, a))
  if (Math.abs(aspin - dspin) > Math.PI) {
    if (aspin < dspin) aspin += Math.PI * 2
    else dspin += Math.PI * 2
  }
  const spin = bezier([aspin, dspin], t)
  const abv = add(v, rot(sub(abbc, abbcbccd), spin))
  const vcd = add(v, rot(sub(bccd, abbcbccd), spin))
  return [
    curve(a, ab, abv, v, attributes),
    curve(v, vcd, cd, d, attributes)
  ]
}
const markers = (a, b, c, d, attributes) => el => toSteps(model.steps, t => circle(bezierP([a, b, c, d], t), attributes))
const stringart = (a, b, c, d, t, attributes) => {
  const ab = bezierP([a, b], t)
  const bc = bezierP([b, c], t)
  const cd = bezierP([c, d], t)
  const abbc = bezierP([ab, bc], t)
  const bccd = bezierP([bc, cd], t)
  return [
    line(ab, bc, attributes),
    line(bc, cd, attributes),
    line(abbc, bccd, attributes)
  ]
}
const stringarts = (a, b, c, d, attributes) => el => toSteps(model.steps, t => stringart(a, b, c, d, t, attributes))
const projection = (a, b, points) => {
  const d = distance(a, b)
  const unit = scale(sub(b, a), 1 / d)
  return points.map(point => add(a, scale(unit, dot(unit, sub(point, a)))))
}
const tLines = (a, b, c, d, attributes) => el => {
  const [bad, cad] = projection(a, d, [b, c])
  return toSteps(model.steps, t => line(bezierP([a, bad, cad, d], t), bezierP([a, b, c, d], t), attributes))
}

const stringsChange = el => e => { model.steps = +el.value }
const showStringsChange = el => e => { model.showingStringArt = el.checked }
const showSpineChange = el => e => { model.showingSpine = el.checked }

render(document.body, h`
  <svg width="100vw" height="100vh" style="display: block;" xmlns="http://www.w3.org/2000/svg">
    ${line(model.b, model.a, { stroke: 'red', 'stroke-dasharray': '0 10 10 0' })}
    ${line(model.c, model.d, { stroke: 'red', 'stroke-dasharray': '0 10 10 0' })}
    ${stretchedCurve(model.a, model.b, model.c, model.d, model.v, { fill: 'none', stroke: 'green' })}
    ${showIfElse(() => model.showingStringArt, [
      markers(model.a, model.b, model.c, model.d, { r: 2, fill: 'none', stroke: '#ff000066' }),
      stringarts(model.a, model.b, model.c, model.d, { r: 2, fill: 'none', stroke: '#ff000033' })
    ])}
    ${showIfElse(() => model.showingSpine, [tLines(model.a, model.b, model.c, model.d, { stroke: '#00ffff88' })])}
    ${draggableCircle(model.a, { r: 7, fill: 'black', stroke: 'none', 'pointer-events': 'all' })}
    ${draggableCircle(model.b, { r: 8, fill: 'none', stroke: 'black', 'pointer-events': 'all' })}
    ${draggableCircle(model.c, { r: 8, fill: 'none', stroke: 'black', 'pointer-events': 'all' })}
    ${draggableCircle(model.d, { r: 7, fill: 'black', stroke: 'none', 'pointer-events': 'all' })}
    ${draggableCircle(model.v, { r: 12, fill: 'none', stroke: 'green', 'pointer-events': 'all' })}
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
    <summary style="outline: none;">details</summary>
    <div>
      <label for="showStrings">Show String Art</label>
      <input type="checkbox" oninput=${showStringsChange} name="showStrings" ${() => model.showingStringArt ? { checked: true } : null}>
    </div>
    <div>
      <label for="steps">Steps</label>
      <input type="range" oninput=${stringsChange} name="steps" value="${() => model.steps}" min="3" max="100">
      ${() => model.steps}
    </div>
    <div>
      <label for="showSpine">Show Spine</label>
      <input type="checkbox" oninput=${showSpineChange} name="showSpine" ${() => model.showingSpine ? { checked: true } : null}>
    </div>
  </details>
`)
