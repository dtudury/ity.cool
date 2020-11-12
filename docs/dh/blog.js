import { h, render, proxy } from './horseless.0.5.1.min.esm.js' // '/unpkg/horseless/horseless.js'
import { getPathData } from './dhmath.js'

const model = window.model = proxy({
  width: 400,
  height: 400,
  min: 400,
  base: 11,
  modulus: 23
})

render(document.body, h`
  <svg width="${() => model.width}px" height="${() => model.height}px" viewBox="0 0 ${() => model.width} ${() => model.height}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${() => 0.5 * model.width}" cy="${() => 0.5 * model.height}" r="${() => 0.5 * model.min}"/>
    <path d="${() => getPathData(model)}"/>
  </svg>
`)
