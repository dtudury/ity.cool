/* eslint-env browser */
import { Field } from './elements/Field.js'
import { render, h, proxy, watchFunction } from './horseless.0.5.3.min.esm.js'

const model = (window.model = proxy(
  localStorage.getItem('dnd-model')
    ? JSON.parse(localStorage.getItem('dnd-model'))
    : {}
))
watchFunction(() => {
  localStorage.setItem('dnd-model', JSON.stringify(model))
})

render(
  document.body,
  h`
    <div draggable="true">
      dnd experiment
    </div>
    <${Field} />
  `
)
