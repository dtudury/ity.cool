import { h } from '../horseless.js'
import dynamic from './dynamic.js'

export default function ({ model, objectStoreWrapper }, children, description) {
  console.log(objectStoreWrapper, model.selected.address)
  return h`<${dynamic} 
    module="${model.selected.module || './moduleChooser.js'}" 
    model=${model.selected} 
    objectStoreWrapper=${objectStoreWrapper.clone(model.selected.address)}
    type="selected"
  />`
}
