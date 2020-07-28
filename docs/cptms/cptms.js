import * as horseless from 'https://horseless.info/esm/0.5.1.min.js'
// import * as horseless from '/esm/0.5.1.min.js'
// import { h, render, proxy } from '/unpkg/horseless/horseless.js'

const model = horseless.proxy({
  module: './repos.js',
  position: { x: 0, y: 0, width: 100, height: 100 }
})

const handleResize = e => {
  model.position.width = window.innerWidth
  model.position.height = window.innerHeight
}
window.addEventListener('resize', handleResize)
handleResize()

const descriptionMap = new Map()
const moduleMap = new Map()
const moduleStates = horseless.proxy({})
function container (attr, children, description) {
  if (!descriptionMap.has(description)) {
    descriptionMap.set(description, {})
  }
  const module = attr.module
  const obj = descriptionMap.get(description)
  if (!obj[module]) {
    obj[module] = () => {
      if (moduleStates[module] === 'loaded') {
        obj[module] = moduleMap.get(module).default(horseless, attr, children, description)
        return obj[module]
      }
      return null
    }
  }
  if (!moduleStates[module]) {
    moduleStates[module] = 'loading'
    import(module).then(moduleActual => {
      moduleMap.set(module, moduleActual)
      moduleStates[module] = 'loaded'
    })
  }
  return obj[module]
}

horseless.render(document.body, horseless.h`
  <${container} module=${() => model.module} model=${model}/>
`)

setTimeout(() => {
  model.module = './asdf.js'
}, 2000)
