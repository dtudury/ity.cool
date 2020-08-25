import { h, showIfElse } from '../horseless.js'
import nav from './nav.js'
import unibox from './unibox.js'
import childList from './childList.js'
import main from './main.js'

const descriptionMap = new WeakMap()

export default function ({ model, objectStoreWrapper }, children, description) {
  objectStoreWrapper.getObject().then(object => {
    if (object) {
      // TODO: make model updater to update rather than clobber children
      Object.assign(model, object)
    }
  })
  function onselect (selected) {
    console.log(selected)
    model.selected = selected
  }
  if (!descriptionMap.has(description)) {
    descriptionMap.set(description, h`
      <div style="display: flex; height: 100%;">
        <${nav} style="flex: 0 1 24rem; display: flex; flex-direction: column;">
          <header>
            <${unibox} model=${model}/>
          </header>
          <${childList} model=${model} onselect=${el => onselect}/>
        </${nav}>
        ${() => JSON.stringify(model.selected)}
        ${showIfElse(() => model.selected, h`<${main} 
          style="flex: 1" 
          model=${model} 
          objectStoreWrapper=${objectStoreWrapper}
        />`)
  }
      </div >
    `)
  }
  return descriptionMap.get(description)
}
