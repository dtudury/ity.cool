import { render, h, proxy } from '../horseless.0.5.3.min.esm.js' // '/unpkg/horseless/horseless.js'
import { model } from '../model.js'

class BElement extends window.HTMLElement {
  static get observedAttributes () {
    return ['v', 'w']
  }

  constructor () {
    super()
    this.model = proxy({})
    this.attachShadow({ mode: 'open' })
    render(
      this.shadowRoot,
      h`
        <style>
          :host {
            display: block;
            width: 200px;
            height: 100px;
            background: green;
            border: 1px solid green;
          }
          div {
            background: yellow;
            border-radius: 20px;
          }
        </style>
        ${() => this.model.v} ${() => this.model.w}
        <div ${this.getDivAttributes} ${(...args) => {
        // console.log('no this', args, this)
      }}>slot here => <slot/></div>
        ${() => !!model.div}
      `
    )
    // console.log(this.shadowRoot.querySelector('div'))
    model.div = this.shadowRoot.querySelector('div')
  }

  getDivAttributes (...args) {
    // console.log('this', args, this)
    return []
  }

  attributeChangedCallback (name, oldValue, newValue) {
    this.model[name] = newValue
    // console.log('attributeChangedCallback', name, oldValue, '=>', newValue)
  }
  // connectedCallback () {}
}

export const bElementName = 'b-element'
window.customElements.define(bElementName, BElement)
const variants = new Map()
export const B_ELEMENT = (attributes, children, description) => {
  if (!variants.has(description)) {
    variants.set(
      description,
      h`<${bElementName} ${attributes}>${children}</>`[0]
    )
  }
  console.log(variants.get(description))
  setTimeout(() => {}, Math.random() * 1000 + 1000)
  return variants.get(description)
}
