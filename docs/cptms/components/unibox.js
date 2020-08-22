import { h, showIfElse } from '../horseless.js'
import octicons from '../octicons.js'

const descriptionMap = new WeakMap()
const buttonStyle = `
  display: inline-flex; 
  align-items: center;
  font-size: inherit;
  border-radius: 6px;
  border: 1px solid black;
  padding: 2px 12px;
  margin: 6px;
`

export default function (attributes, children, description) {
  const model = attributes.model
  const handleInput = el => e => {
    console.log('input')
    if (e.target.value) model.input = e.target.value
    else delete model.input
  }
  const createRepo = el => e => {
    console.log('cd')
  }
  if (!descriptionMap.has(description)) {
    descriptionMap.set(description, h`
      <input 
        oninput=${handleInput} 
        value="${() => model.input || ''}"
        placeholder="Filter/Create" 
        style="
          width: 100%;
          flex: 1;
          font: inherit;
          border-radius: 6px;
          border: 1px solid black;
          padding: 2px 12px;
          margin: 6px;
        "
      />
      ${showIfElse(() => model.input, h`
        <button onclick=${createRepo} style=${buttonStyle}>
          ${octicons('plus-16', { style: 'padding-right: 4px;' })} 
          ${octicons('file-directory-16', { style: 'padding-right: 4px;' })} 
        </button>
        <button onclick=${createRepo} style=${buttonStyle}>
          ${octicons('plus-16', { style: 'padding-right: 4px;' })} 
          ${octicons('file-16', { style: 'padding-right: 4px;' })} 
        </button>
      `)}
    `)
  }
  return descriptionMap.get(description)
}