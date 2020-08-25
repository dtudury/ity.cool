import { h } from '../horseless.js'
import seeker from './seeker.js'

export default function ({ model, objectStoreWrapper, onselect, type }, children, description) {
  const onclick = el => e => {
    onselect(model)
  }
  if (model.selected && type === 'selected') {
    return h`<${seeker} model=${() => model.selected} objectStoreWrapper=${() => objectStoreWrapper.clone(model.selected.address)}/>`
  } else if (type === 'selector') {
    return h`
      <div onclick=${onclick}>
        ${() => model.name + ' ' + model.address}
      </div>
    `
  }
}
