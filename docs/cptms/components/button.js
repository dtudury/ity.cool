import { h } from '../horseless.js'

export default function (attributes, children) {
  attributes.style = `
    display: inline-flex; 
    align-items: center;
    font-size: inherit;
    border-radius: 6px;
    border: 1px solid black;
    padding: 2px 12px;
    margin: 6px;
  ` + (attributes.style || '')
  return h`
    <button ${attributes}>
      ${children}
    </button>
  `
}
