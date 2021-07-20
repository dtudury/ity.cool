/* eslint-env browser */
import { render, h } from '../horseless.0.5.3.min.esm.js'

export const EditableSpan = 'ity.cool-dnd-elements-editable_span'

window.customElements.define(
  EditableSpan,
  class extends HTMLElement {
    constructor () {
      super()
      this.attachShadow({ mode: 'open' })
    }

    connectedCallback () {
      const onblur = el => event => {
        el.textContent = this.datum.message
      }
      const onkeydown = el => event => {
        event.stopPropagation()
        switch (event.key) {
          case 'Enter':
            this.datum.message = el.textContent.trim()
            this.blur()
            break
          case 'Escape':
            this.datum.message = el.textContent
            this.blur()
            break
        }
      }

      render(
        this.shadowRoot,
        h`<style>
            span {
              margin: 0;
              padding: 6px;
            }
          </style>
          <span 
            contenteditable="true" 
            onblur=${onblur}
            onkeydown=${onkeydown}
          >
            ${() => this?.datum?.message}
          </span>
        `
      )
    }
  }
)
