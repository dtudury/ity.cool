/* eslint-env browser */
import { render, h, proxy, showIfElse, watchFunction } from './horseless.0.5.1.min.esm.js'
const model = window.model = proxy(localStorage.getItem('model') ? JSON.parse(localStorage.getItem('model')) : {
  a: { x: 100, y: 100 },
  b: { x: 200, y: 100 },
  c: { x: 200, y: 200 },
  d: { x: 100, y: 200 },
  v: { x: 150, y: 150 },
  showingStringArt: true,
  strings: 9
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
const cubic = (a, b, c, d, t, r = 1 - t) => a * t * t * t + 3 * b * t * t * r + 3 * c * t * r * r + d * r * r * r
const cubicP = (a, b, c, d, t) => ({ x: cubic(a.x, b.x, c.x, d.x, t), y: cubic(a.y, b.y, c.y, d.y, t) })
const linear = (a, b, t, r = 1 - t) => a * t + r * b
const linearP = (a, b, t) => ({ x: linear(a.x, b.x, t), y: linear(a.y, b.y, t) })

const p2xy = p => `${p.x} ${p.y}`
const toSteps = (steps, f) => steps > 1 ? Array(steps).fill().map((_, i) => f(i / (steps - 1))) : null
const line = (a, b, attributes) => h`<path d="M${() => p2xy(a)}L${() => p2xy(b)}" ${attributes}/>`
const curve = (a, b, c, d, attributes) => h`<path d="M${() => p2xy(a)}C${() => p2xy(b)} ${() => p2xy(c)} ${() => p2xy(d)}" ${attributes}/>`
const markers = (a, b, c, d, attributes) => el => toSteps(model.strings, t => circle(cubicP(a, b, c, d, t), attributes))
const sub = (a, b, c, d, t, attributes) => {
  const ab = linearP(a, b, t)
  const bc = linearP(b, c, t)
  const cd = linearP(c, d, t)
  const abbc = linearP(ab, bc, t)
  const bccd = linearP(bc, cd, t)
  return [line(ab, bc, attributes), line(bc, cd, attributes), line(abbc, bccd, attributes)]
}
const subs = (a, b, c, d, attributes) => el => toSteps(model.strings, t => sub(a, b, c, d, t, attributes))
const tLines = (a, b, c, d) => el => {
  const angle = Math.atan2(d.y - a.y, d.x - a.x)
  const unitAD = { x: Math.cos(angle), y: Math.sin(angle) }
  console.log(unitAD)
  return toSteps(model.strings, t => circle(linearP(a, d, t), { r: 2 }))
}

const stringsChange = el => e => { model.strings = +el.value }
const showStringsChange = el => e => { model.showingStringArt = el.checked }

render(document.body, h`
  <svg width="100vw" height="100vh" style="display: block;" xmlns="http://www.w3.org/2000/svg">
    ${line(model.b, model.a, { stroke: 'blue', 'stroke-dasharray': '0 10 10 0' })}
    ${line(model.c, model.d, { stroke: 'blue', 'stroke-dasharray': '0 10 10 0' })}
    ${curve(model.a, model.b, model.c, model.d, { fill: 'none', stroke: 'red' })}
    ${showIfElse(() => model.showingStringArt, [
      markers(model.a, model.b, model.c, model.d, { r: 2, fill: 'none', stroke: '#ff000066' }),
      subs(model.a, model.b, model.c, model.d, { r: 2, fill: 'none', stroke: '#ff000033' })
    ])}
    ${tLines(model.a, model.b, model.c, model.d)}
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
      <label for="strings">Strings</label>
      <input type="range" oninput=${stringsChange} name="strings" value="${() => model.strings}" min="3" max="100">
      ${() => model.strings}
    </div>
  </details>
`)
