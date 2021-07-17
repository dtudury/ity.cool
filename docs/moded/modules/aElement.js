import { render, h } from '../horseless.0.5.3.min.esm.js' // '/unpkg/horseless/horseless.js'

class AElement extends window.HTMLDivElement {
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    render(
      this.shadowRoot,
      h`
      <style>
        div {
          width: 100px;
          height: 100px;
          background: red;
        }
      </style>
      <div>asdf</div>
    `
    )
  }
  // connectedCallback () {}
}

const aElementName = 'a-element'
window.customElements.define(aElementName, AElement, { extends: 'div' })
const tieUps = new Map()
export const A_ELEMENT = (attributes, children, description) => {
  if (!tieUps.has(description)) {
    tieUps.set(description, h`<div is="${aElementName}"/>`)
  }
  return tieUps.get(description)
}
