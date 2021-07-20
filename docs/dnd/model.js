import { proxy, watchFunction } from './horseless.0.5.3.min.esm.js'

export const model = (window.model = proxy({
  data: window.localStorage.getItem('dnd-model.data')
    ? JSON.parse(window.localStorage.getItem('dnd-model.data'))
    : []
}))
watchFunction(() => {
  window.localStorage.setItem('dnd-model.data', JSON.stringify(model.data))
})
