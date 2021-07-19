/* eslint-env browser */
import { render, h } from '../horseless.0.5.3.min.esm.js'

export const FieldAddButton = 'ity.cool-dnd-elements-field_add_button'

window.customElements.define(
  FieldAddButton,
  class extends HTMLElement {
    constructor () {
      super()
      this.attachShadow({ mode: 'open' })
      render(
        this.shadowRoot,
        h`<style>
            button {
              padding: 18px;
              margin: 6px;
              border-radius: 6px;
              box-shadow: 0 1px 5px black;
              background: magenta;
              border: 1px solid pink;
            }
          </style>
          <button>Add Field</button>
        `
      )
    }

    connectedCallback () {
      this.addEventListener('click', e => {
        if (!this.model) {
          return console.error('no model found for', this)
        }
        this.model.data = this.model.data || []
        this.model.data.push({ message: 'hi - ' + Math.random() })
      })
    }
  }
)
