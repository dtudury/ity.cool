
import { h, render, proxy } from '../esm/0.5.1.min.js'

const model = proxy({
  recipe: 'd+d',
  q: '3+4',
  a: '7',
  correct: 0
})

function setFromHash () {
  if (document.location.hash) {
    model.recipe = document.location.hash.substring(1)
    newProblem()
  }
}
setFromHash()
window.addEventListener('hashchange', setFromHash)

function newProblem () {
  let isDynamic = false
  let p = 0
  function rangeFromRecipe () {
    const lParen = OpFromRecipe()
    if (lParen !== '(') throw new Error('not a left paren')
    const left = Number(numberFromRecipe())
    const dash = OpFromRecipe()
    if (dash !== '-') throw new Error('not a dash')
    const right = Number(numberFromRecipe())
    const rParen = OpFromRecipe()
    if (rParen !== ')') throw new Error('not a right paren')
    --p
    if (left !== right) {
      isDynamic = true
    }
    return '' + (left + Math.floor(Math.random() * (1 + right - left)))
  }
  function numberFromRecipe () {
    let c = model.recipe.charAt(p)
    let out = ''
    while (c.match(/[\dd(]/)) {
      if (c === '(') {
        out = out + rangeFromRecipe()
      } else if (c === 'd') {
        out = out + Math.floor(Math.random() * 10)
        isDynamic = true
      } else {
        out = out + c
      }
      c = model.recipe.charAt(++p)
    }
    return out
  }
  function OpFromRecipe () {
    return model.recipe.charAt(p++)
  }
  // let variable = false
  const a = numberFromRecipe()
  const op = OpFromRecipe()
  const b = numberFromRecipe()
  let q = a + ' ' + op + ' ' + b
  if (isDynamic && model.q === q) {
    return newProblem()
  }
  model.q = q
  model.a = eval(model.q) // eslint-disable-line no-eval
}

window.addEventListener('hashchange', setFromHash)

const oninput = el => e => {
  if (Number(el.value) === model.a) {
    el.value = ''
    model.correct++
    newProblem()
  }
}

render(document.body, h`
  ${() => model.q} =
  <input oninput=${oninput} type="number" autofocus>
  <br>
  correct: ${() => model.correct}
`)
document.body.querySelector('input').focus()
