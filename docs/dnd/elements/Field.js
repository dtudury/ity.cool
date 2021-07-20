/* eslint-env browser */
import { render, h } from '../horseless.0.5.3.min.esm.js'
import { model } from '../model.js'
import { EditableSpan } from './EditableSpan.js'

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
      this.addEventListener('dragstart', event => {
        model.dragging = this.datum
        event.dataTransfer.dropEffect = 'none'
      })
      this.addEventListener('dragend', event => {
        if (model.dragging === this.datum) {
          delete model.dragging
        }
      })
      this.addEventListener('drop', event => {
        event.preventDefault()
        console.log('drop', model.dragging, model.hovering, this.datum)
      })
      this.addEventListener('dragover', event => {
        if (model.dragging !== this.datum) {
          event.dataTransfer.dropEffect = 'move'
          event.preventDefault()
        } else {
          event.dataTransfer.dropEffect = 'none'
        }
      })
      this.addEventListener('dragenter', event => {
        model.hovering = this.datum
      })
      this.addEventListener('dragleave', event => {
        if (model.hovering === this.datum) {
          delete model.hovering
        }
      })

      const g = randomC()
      const color = () => (g > 127 ? 'black' : 'white')
      const background = randomHex() + cToHex(g) + randomHex()

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
            <${EditableSpan} datum=${this.datum}/>
          </div>
        `
      )
    }
  }
)
