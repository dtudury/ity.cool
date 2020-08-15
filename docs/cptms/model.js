import { proxy } from './horseless.js'
import { getObject } from './db.js'

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

getObject().then(result => {
  Object.assign(model.root, result)
})
