import { proxy } from './horseless.js'
import { ObjectStoreWrapper } from './db.js'

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

const objectStoreWrapper = new ObjectStoreWrapper()
objectStoreWrapper.getObject().then(result => {
  Object.assign(model.root, result)
})
