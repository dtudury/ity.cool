import { h } from '../horseless.js'

const descriptionMap = new WeakMap()

export default function (attributes, children, description) {
  if (!descriptionMap.has(description)) {
    attributes.style = `
    ` + (attributes.style || '')
    descriptionMap.set(description, h`
      <nav ${attributes}>
        ${children}
      </nav>
    `)
  }
  return descriptionMap.get(description)
}
