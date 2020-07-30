import { h } from './horseless.js'

export default function ({ model }) {
  console.log(model)
  return [() => {
    if (model.expanded) {
      return h`<div>asdf</div>`
    }
  }]
}
