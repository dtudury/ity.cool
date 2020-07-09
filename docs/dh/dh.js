import { h, render, proxy } from './horseless.0.5.1.min.esm.js' // '/unpkg/horseless/horseless.js'

const model = window.model = proxy({
  base: 1026,
  modulus: 4999
})

function stepToCommand (prefix, step) {
  const steps = model.modulus - 1
  const angle = 2 * Math.PI * ((step - 0.5) / steps - 0.25)
  return `${prefix}${100 * Math.cos(angle)} ${100 * Math.sin(angle)}`
}

function pathData () {
  const commands = []
  let prefix = 'M'
  let step = model.base
  let count = 0
  do {
    count++
    commands.push(stepToCommand(prefix, step))
    step = step * model.base % model.modulus
    prefix = 'L'
  } while (step !== model.base)
  console.log(count)
  return commands.join('') + 'Z'
}

render(document.body, h`
  <svg width="100vmin" height="100vmin" viewBox="-110 -110 220 220" xmlns="http://www.w3.org/2000/svg">
    <circle cx="0" cy="0" r="100"/>
    <path d="${pathData}"/>
  </svg>
`)
