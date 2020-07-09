import { h, render, proxy } from './horseless.0.5.1.min.esm.js' // '/unpkg/horseless/horseless.js'

const model = window.model = proxy({
  base: 1026,
  modulus: 4999
})

function stepToCommand (prefix, step) {
  const steps = model.modulus
  const angle = 2 * Math.PI * (step / steps - 0.25)
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

render(document.body, h`
  <svg width="100vmin" height="100vmin" viewBox="-110 -110 220 220" xmlns="http://www.w3.org/2000/svg">
    <circle cx="0" cy="0" r="100"/>
    <path d="${pathData}"/>
  </svg>
`)
