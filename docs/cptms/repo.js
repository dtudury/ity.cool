import { h } from './horseless.js'

export default function ({ name, model }) {
  console.log(name, model)
  model.v = 0
  setInterval(() => model.v++, 1000)
  return h`<div>name${() => model.v}</div>`
}
