import { proxy } from './horseless.js'

export const model = window.model = proxy({
  position: {
    x: 0,
    y: 0,
    width: 100,
    height: 100
  },
  repos: {},
  repoList: []
})

const handleResize = e => {
  model.position.width = window.innerWidth
  model.position.height = window.innerHeight
}
window.addEventListener('resize', handleResize)
handleResize()
