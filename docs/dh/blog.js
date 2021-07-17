import { h, render, proxy } from './horseless.0.5.1.min.esm.js' // '/unpkg/horseless/horseless.js'
import { getPathData } from './dhmath.js'

const model = window.model = proxy({
  width: 400,
  height: 400,
  min: 400,
  base: 2,
  modulus: 13,
  max: 0
})

const onchange = el => e => {
  console.log('onchange', e)
}

const oninput = el => e => {
  model.max = Number(e.target.value)
  console.log('oninput', e.target.value)
}

render(document.body, h`
  <h1>modular exponentiation</h1>
  Sounds fancy, right? It's not... well... okay, it kind of is. But! Calculating it is realitively straight forward:
  <ol>
    <li>
      Start with a number. 
    </li>
    <li>
      Multiply the number by itself a few times times. 
    </li>
    <li>
      Divide it by a second number. 
    </li>
    <li>
      The part you care about is whatever is left over, the remainder.
    </li>
  </ol>
  This recipe is called "modular exponentiation" and it's super important. 
  without it you'd be ordering your Christmas presents over the phone (and it'd be a land line)
  <br>
  (A<sup>3</sup>)<sup><sup>2</sup></sup> === (A<sup>2</sup>)<sup><sup>3</sup></sup>
  <br>
  (A * A * A) * (A * A * A) === (A * A) * (A * A) * (A * A)
  <h1>exponential properties</h1>
  <h1>fermat's little theorem</h1>
  <h1>diffie-hellman</h1>
  <h1>magic</h1>
  <div>
    <label for="steps">
      <input type="range" id="steps" name="steps" onchange=${onchange} oninput=${oninput} min="0" max="${() => model.modulus - 1}" value="0" step="1">
      steps
    </label>
  </div>
  <svg width="${() => model.width}px" height="${() => model.height}px" viewBox="0 0 ${() => model.width} ${() => model.height}" xmlns="http://www.w3.org/2000/svg">
    <circle stroke="red" cx="${() => 0.5 * model.width}" cy="${() => 0.5 * model.height}" r="${() => 0.5 * model.min}"/>
    <path stroke="darkred" d="${() => getPathData(model)}"/>
  </svg>
`)
