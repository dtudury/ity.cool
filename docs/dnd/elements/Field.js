/* eslint-env browser */
import { render, h } from '../horseless.0.5.3.min.esm.js'

export const Field = 'ity.cool-dnd-elements-field'

const randomC = () => Math.floor(Math.random() * 256)
const cToHex = c => ('0' + c.toString(16)).substr(-2)
const randomHex = () => cToHex(randomC())

window.customElements.define(
  Field,
  class extends HTMLElement {
    constructor () {
      super()
      this.attachShadow({ mode: 'open' })
    }

    connectedCallback () {
      this.addEventListener('dragstart', () => {})

      const g = randomC()
      const color = () => (g > 127 ? 'black' : 'white')
      const background = randomHex() + cToHex(g) + randomHex()
      const onblur = el => event => {
        this.datum.message = el.textContent
      }

      render(
        this.shadowRoot,
        h`<style>
            div {
              display: inline-block;
              color: ${color};
              padding: 18px;
              margin: 6px;
              border-radius: 6px;
              box-shadow: 0 1px 5px black;
              background: #${background};
            }
            span {
              margin: 0;
              padding: 6px;
            }
          </style>
          <div draggable="true">
            <span 
              contenteditable="true" 
              onblur=${onblur}
              onclick=${onclick}>
              ${() => this?.datum?.message}
            </span>
          </div>
        `
      )
    }
  }
)
