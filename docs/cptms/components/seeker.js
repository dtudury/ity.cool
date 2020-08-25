import { h, mapEntries } from '../horseless.js'
import moduleChooser from './moduleChooser.js'
import nav from './nav.js'
import unibox from './unibox.js'

const descriptionMap = new WeakMap()

export default function ({ model, objectStoreWrapper }, children, description) {
  function onselect (selected) {
    console.log('selecting', selected.address)
    if (model.selected) {
      delete model.selected.children
      delete model.selected.selected
    }
    model.selected = selected
  }
  function childMapper (child) {
    return h`<${moduleChooser} model=${child} onselect=${el => onselect} type="selector"/>`
  }
  if (!descriptionMap.has(description)) {
    console.log('new', model.address)
    descriptionMap.set(description, h`
      <${nav} style="
        overflow-y: scroll;
        flex: 1 0 24rem; 
        display: flex; 
        flex-direction: column;
      ">
        <header style="position: sticky; top: 0;">
          <${unibox} model=${model} objectStoreWrapper=${objectStoreWrapper}/>
        </header>
        ${mapEntries(() => model.children, childMapper)}
      </${nav}>
      <${moduleChooser} 
        model=${model} 
        objectStoreWrapper=${objectStoreWrapper}
        type="selected"
      />
    `)
    objectStoreWrapper.getObject().then(object => {
      if (object) {
        // TODO: make model updater to update rather than clobber children
        console.log('getting', objectStoreWrapper.key)
        Object.assign(model, object)
      }
    })
  }
  return descriptionMap.get(description)
}
