import { proxy, render, h } from './horseless.js'
import { dynamic } from './nodes.js'

const model = proxy({ position: { x: 0, y: 0, width: 100, height: 100 } })

const handleResize = e => {
  model.position.width = window.innerWidth
  model.position.height = window.innerHeight
}
window.addEventListener('resize', handleResize)
handleResize()

render(document.body, h`
  <${dynamic} module="./repos.js" model=${model}/>
`)
