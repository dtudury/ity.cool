import { h } from '../horseless.js'
import input from './input.js'
import button from './button.js'
import octicons from '../octicons.js'

export default function (attributes) {
  const model = attributes.model
  const handleSubmit = el => e => {
    e.preventDefault()
    console.log(e.target)
  }
  /*
  attributes.style = `
    font-size: inherit;
    border-radius: 6px;
    border: 1px solid black;
    padding: 2px 12px;
    margin: 6px;
  ` + (attributes.style || '')
  */
  if (model.module) {
    return h`
      <div ${attributes}>
        ${() => JSON.stringify(attributes)}
      </div>
    `
  } else {
    return h`
      <form onsubmit=${handleSubmit}>
        <div style="display: flex; align-items: center; font-weight: bold;">
          ${octicons('dot-16', { style: 'padding: 8px;' })} 
          Initialize Repository:
        </div>
        <label style="display:flex; align-items: center;">
          ${octicons('key-16', { style: 'padding: 8px;' })} 
          Passphrase:
          <${input} name="passphrase" style="flex-grow: 1;" required/>
        </label>
        <label style="display:flex; align-items: center;">
          ${octicons('gear-16', { style: 'padding: 8px;' })} 
          Iterations:
          <${input} name="iterations" type="number" defaultValue="20000" style="flex-grow: 1;"/>
        </label>
        <div style="display: flex; align-items: center; justify-content: flex-end;">
          <${button} type="submit">${octicons('shield-lock-16', { style: 'padding-right: 4px;' })} Set Encryption</button>
        </div>
      </form>
    `
  }
}
