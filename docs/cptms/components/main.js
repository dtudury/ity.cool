import { h } from '../horseless.js'

const descriptionMap = new WeakMap()

export default function (attributes, children, description) {
  if (!descriptionMap.has(description)) {
    attributes.style = `
    ` + (attributes.style || '')
    descriptionMap.set(description, h`
      <main ${attributes}>
        ${children}
      </main>
    `)
  }
  return descriptionMap.get(description)
}
