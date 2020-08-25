import { h, showIfElse } from '../horseless.js'
import octicons from '../octicons.js'

const descriptionMap = new WeakMap()

export default function ({ model, objectStoreWrapper }, children, description) {
  const handleInput = el => e => {
    if (e.target.value) model.input = e.target.value
    else delete model.input
  }
  const submit = el => e => {
    e.preventDefault()
    model.nextChild = model.nextChild || 0
    const address = model.address + '.' + model.nextChild
    ++model.nextChild
    model.children = model.children || []
    model.children.push({ address, name: model.input })
    delete model.input
    model.updated = true
  }
  const save = el => e => {
    e.preventDefault()
    objectStoreWrapper.putObject({
      children: model.children.map(child => ({
        name: child.name,
        address: child.address
      })),
      nextChild: model.nextChild
    })
    model.updated = false
  }
  const cancel = el => e => {
    e.preventDefault()
    delete model.input
  }
  const buttonStyle = `
    display: inline-flex; 
    align-items: center;
    font-size: inherit;
    border-radius: 6px;
    border: 1px solid black;
    padding: 2px 4px;
    margin: 6px;
  `
  if (!descriptionMap.has(description)) {
    descriptionMap.set(description, h`
      <form 
        onsubmit=${submit} 
        style="
          display: flex; 
          align-items: center;
          width: 100%; 
          background: DimGray; 
          padding-right: 21px; 
          box-sizing: border-box;
        "
      >
        ${octicons('repo-16', { style: 'padding: 8px;' })} 
        <input 
          oninput=${handleInput} 
          value=${() => model.input || ''}
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
          <button style=${buttonStyle}>
            ${octicons('plus-16')}
          </button>
          <button style=${buttonStyle} onclick=${cancel}>
            ${octicons('x-16')}
          </button>
        `)}
        ${showIfElse(() => model.updated, h`
          <button style=${buttonStyle} onclick=${save}>
            ${octicons('git-merge-16')}
          </button>
        `)}
      </form>
    `)
  }
  return descriptionMap.get(description)
}
