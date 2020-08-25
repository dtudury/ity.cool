import { h } from '../horseless.js'
import seeker from './seeker.js'

export default function ({ model, objectStoreWrapper, onselect, type }, children, description) {
  const onclick = el => e => {
    onselect(model)
  }
  if (type === 'selected') {
    return h`<${seeker} model=${model} objectStoreWrapper=${objectStoreWrapper}/>`
  }
  return h`
    <div onclick=${onclick}>
      ${() => JSON.stringify(model)}
    </div>
  `
}
