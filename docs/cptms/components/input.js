import { h } from '../horseless.js'

const descriptionMap = new WeakMap()

export default function (attributes, children, description) {
  if (!descriptionMap.has(description)) {
    attributes.style = `
      font-size: inherit;
      border-radius: 6px;
      border: 1px solid black;
      padding: 2px 12px;
      margin: 6px;
    ` + (attributes.style || '')
    descriptionMap.set(description, h`
      <input ${attributes}>
        ${children}
      </input>
    `)
  }
  return descriptionMap.get(description)
}
