import { render, h } from "../horseless.0.5.3.min.esm.js"; // '/unpkg/horseless/horseless.js'
import { model } from "../model.js";

class BElement extends window.HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    render(
      this.shadowRoot,
      h`
      <style>
        :host {
          display: block;
          width: 100px;
          height: 100px;
          background: green;
          border: 1px solid green;
        }
        div {
          background: blue;
          border-radius: 20px;
        }
      </style>
      <div ${this.getDivAttributes} ${(...args) => {
        console.log("no this", args);
      }}>asdf</div>
      ${() => !!model.div}
    `
    );
    console.log(this.shadowRoot.querySelector("div"));
    model.div = this.shadowRoot.querySelector("div");
  }
  getDivAttributes(...args) {
    console.log("this", args);
    return [];
  }
  connectedCallback() {}
}

const bElementName = "b-element";
window.customElements.define(bElementName, BElement);
const tieUps = new Map();
export const B_ELEMENT = (attributes, children, description) => {
  if (!tieUps.has(description)) tieUps.set(description, h`<${bElementName}/>`);
  return tieUps.get(description);
};
