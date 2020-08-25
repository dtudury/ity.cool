import { h, mapEntries } from '../horseless.js'
import dynamic from './dynamic.js'

const descriptionMap = new WeakMap()

export default function ({ model, onselect }, children, description) {
  function childMapper (child) {
    return h`<${dynamic} module="${child.module || './moduleChooser.js'}" model=${child} onselect=${el => onselect} type="selector"/>`
  }
  if (!descriptionMap.has(description)) {
    descriptionMap.set(description, h`${mapEntries(() => model.children, childMapper)}`)
  }
  return descriptionMap.get(description)
}
