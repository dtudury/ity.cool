import { h, render, proxy } from './horseless.0.5.1.min.esm.js' // '/unpkg/horseless/horseless.js'

const model = window.model = proxy({
  scale: 100,
  width: 100,
  height: 100,
  base: 1026,
  modulus: 4999
})

function handleResize () {
  model.width = document.body.offsetWidth
  model.height = document.body.offsetHeight
}
window.addEventListener('resize', handleResize)
handleResize()

function stepToCommand (prefix, step) {
  const steps = model.modulus
  const angle = 2 * Math.PI * (step / steps - 0.25) // put top between 1 and -1 (there is no zero (or really -1 but I know what I mean))
  return `${prefix}${100 * Math.cos(angle)} ${100 * Math.sin(angle)}`
}

function pathData () {
  const modulus = model.modulus
  const base = model.base % modulus
  const commands = []
  let prefix = 'M'
  let step = base
  let count = 0
  do {
    count++
    commands.push(stepToCommand(prefix, step))
    step = step * base % modulus
    prefix = 'L'
  } while (step !== base)
  console.log(count)
  return commands.join('') + 'Z'
}

const scaleChange = el => e => {
  console.log(el.value)
  model.scale = el.value
  console.log(el.value)
}

render(document.body, h`
  <details>
    <summary>details</summary>
    <label for="scale">Scale</label>
    <input type="number" onchange=${scaleChange} name="scale" id="scale" value="${() => model.scale}" min="${() => model.scale / 2}" max="${() => model.scale * 2}" step="${() => model.scale * 1.5}">
  </details>
  <svg width="${() => model.width}px" height="${() => model.height}px" viewBox="-110 -110 220 220" xmlns="http://www.w3.org/2000/svg">
    <circle cx="0" cy="0" r="100"/>
    <path d="${pathData}"/>
  </svg>
`)
