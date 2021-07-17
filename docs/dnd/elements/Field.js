/* eslint-env browser */
import { render, h } from '../horseless.0.5.3.min.esm.js'

export const Field = 'ity.cool-dnd-elements-field'

window.customElements.define(
  Field,
  class extends HTMLElement {
    constructor () {
      super()
      this.attachShadow({ mode: 'open' })
      render(
        this.shadowRoot,
        h`<style>
            div {
              width: 100px;
              height: 100px;
              background: red;
            }
          </style>
          <div draggable="true">asdf</div>
        `
      )
    }

    connectedCallback () {
      this.addEventListener('dragstart', console.log)
      this.addEventListener('click', console.log)
    }
  }
)
