import { proxy } from './horseless.js'

export const model = window.model = proxy({
  position: {
    width: 100,
    height: 100
  }
})

const handleResize = e => {
  model.position.width = window.innerWidth
  model.position.height = window.innerHeight
}
window.addEventListener('resize', handleResize)
handleResize()
