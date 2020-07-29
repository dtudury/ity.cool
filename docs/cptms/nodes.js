import { proxy } from './horseless.js'

const descriptionMap = new Map()
const moduleMap = new Map()
const moduleStates = proxy({})

export function dynamic (attr, children, description) {
  if (!descriptionMap.has(description)) {
    descriptionMap.set(description, {})
  }
  const module = attr.module
  const instanceByModule = descriptionMap.get(description)
  if (!instanceByModule[module]) {
    instanceByModule[module] = () => {
      if (moduleStates[module] === 'loaded') {
        instanceByModule[module] = moduleMap.get(module).default(attr, children, description)
        return instanceByModule[module]
      }
      return null
    }
  }
  if (!moduleStates[module]) {
    moduleStates[module] = 'loading'
    import(module).then(actualModule => {
      moduleMap.set(module, actualModule)
      moduleStates[module] = 'loaded'
    })
  }
  return instanceByModule[module]
}
