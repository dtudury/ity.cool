import { h } from '../horseless.js'

export default function (attributes, children) {
  attributes.style = `
    font-size: inherit;
    border-radius: 6px;
    border: 1px solid black;
    padding: 2px 12px;
    margin: 6px;
  ` + (attributes.style || '')
  return h`
    <input ${attributes}>
      ${children}
    </input>
  `
}
