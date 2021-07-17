import {
  watchFunction,
  render,
  h,
  // copyGently,
  mapEntries
} from './horseless.0.5.3.min.esm.js' // '/unpkg/horseless/horseless.js'
import { model, saveModel } from './model.js'
import { A_ELEMENT } from './modules/aElement.js'
import { bElementName } from './modules/bElement.js'

// const a = { a: 1, b: 2, c: 3 }
// const x = { x: 100, y: 200, z: 300 }

// const q = copyGently(a, x)
// console.log(q, q === a)
// console.log(q, q === x)

function updateDimensions () {
  model.dimensions = { width: window.innerWidth, height: window.innerHeight }
}
updateDimensions()
window.addEventListener('resize', updateDimensions, false)
watchFunction(saveModel)

const arr = [1, 2, 3]

render(
  document.body,
  h`
  ${mapEntries(arr, e => {
    return h`<${bElementName} v=${e} w=${() => model.dimensions.width}>${() =>
      model.dimensions.height}</>`
  })}
  <${A_ELEMENT}/>
  <${bElementName} o=${{ a: 1, b: 2 }}>
    w <b>x</b> h: ${() => model.dimensions.width} <b>x</b> ${() =>
    model.dimensions.height}
  </closing-tag-name-ignored?!>
`
)

model.x = null
model.arr = []
model.arr.push({ a: null })
