import { proxy, watchFunction } from './horseless.0.5.3.min.esm.js'

export const model = (window.model = proxy(
  window.localStorage.getItem('dnd-model')
    ? JSON.parse(window.localStorage.getItem('dnd-model'))
    : {}
))
watchFunction(() => {
  window.localStorage.setItem('dnd-model', JSON.stringify(model))
})
