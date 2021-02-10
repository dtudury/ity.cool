/* eslint-env browser */
import { render, h, proxy } from './horseless.0.5.1.min.esm.js'
const model = window.model = proxy({
  width: window.innerWidth,
  height: window.innerHeight,
  daytime: 0,
  yeartime: 0
})

const arc = (x, y, inner, outer, start, stop, attributes) => {
  const innerStart = [x + Math.sin(start) * inner, y - Math.cos(start) * inner]
  const innerStop = [x + Math.sin(stop) * inner, y - Math.cos(stop) * inner]
  const outerStart = [x + Math.sin(start) * outer, y - Math.cos(start) * outer]
  const outerStop = [x + Math.sin(stop) * outer, y - Math.cos(stop) * outer]
  const bigArc = (stop - start) > Math.PI ? 1 : 0
  return h`<path 
    d="
      M${innerStart[0]} ${innerStart[1]} A${inner} ${inner} 0 ${bigArc} 1 ${innerStop[0]} ${innerStop[1]}
      L${outerStop[0]} ${outerStop[1]} A${outer} ${outer}  0 ${bigArc} 0 ${outerStart[0]} ${outerStart[1]}
      L${innerStart[0]} ${innerStart[1]}
    " ${attributes}/>`
}

const arcs = (t, r, x, y) => {
  const output = []
  for (let i = 0; i < 16; ++i) {
    let start, stop
    if (t < 0.5) {
      start = 0
      stop = 4 * Math.PI * t
    } else {
      start = 4 * Math.PI * (t - 0.5)
      stop = Math.PI * 2
    }
    output.push(arc(x, y, r * 0.88, r, start, stop, { stroke: 'white', fill: '#0000003f' }))
    r *= 0.9
    t = (t * 2) % 1
  }
  return output
}

const dayArcs = el => {
  const t = model.daytime
  const r = 0.9 * Math.min(model.width, model.height) / 2
  const x = model.width * 0.5
  const y = model.height * 0.5
  return arcs(t, r, x, y)
}

const yearArcs = el => {
  const t = model.yeartime
  const r = 0.15 * Math.min(model.width, model.height) / 2
  const x = model.width * 0.8
  const y = model.height * 0.2
  return arcs(t, r, x, y)
}

render(document.body, h`
  <svg width="100vw" height="100vh" style="display: block; background: oldlace;" xmlns="http://www.w3.org/2000/svg">
    ${dayArcs}
    ${yearArcs}
  </svg>
`)

function updateTime () {
  const offset = -(new Date()).getTimezoneOffset() / (24 * 60)
  model.yeartime = (offset / 365 + Date.now() / (365 * 24 * 60 * 60 * 1000)) % 1
  model.daytime = (offset + Date.now() / (24 * 60 * 60 * 1000)) % 1
  requestAnimationFrame(updateTime)
}
updateTime()

window.onresize = () => {
  model.width = window.innerWidth
  model.height = window.innerHeight
}
