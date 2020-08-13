import { proxy } from './horseless.js'
import { readObject } from './db.js'

export const model = window.model = proxy({
  position: {
    width: 100,
    height: 100
  },
  root: {}
})

const handleResize = e => {
  model.position.width = window.innerWidth
  model.position.height = window.innerHeight
}
window.addEventListener('resize', handleResize)
handleResize()

readObject().then(result => {
  Object.assign(model.root, result)
})
