import { watchFunction, render, h, copyGently } from './horseless.0.5.3.min.esm.js' // '/unpkg/horseless/horseless.js'
import { model, saveModel } from './model.js'
import { A_ELEMENT } from './modules/aElement.js'
import { B_ELEMENT } from './modules/bElement.js'

const a = {a:1, b: 2, c: 3}
const x = {x:100, y: 200, z: 300}

const q = copyGently(a, x)
console.log(q, q === a)
console.log(q, q === x)

function updateDimensions () {
  model.dimensions = { width: window.innerWidth, height: window.innerHeight }
}
updateDimensions()
window.addEventListener('resize', updateDimensions, false)
watchFunction(saveModel)

render(document.body, h`
  <${A_ELEMENT}/>
  <${B_ELEMENT}/>
`)
