import { h, showIfElse } from './horseless.js'
import { putObject } from './db.js'
import octicons from './octicons.js'
import repo from './repo.js'
import input from './components/input.js'
import button from './components/button.js'
import { mapEntries } from '../esm/0.5.1.min.js'

function saveModel ({ module, stores, created }, address) {
  stores = JSON.parse(JSON.stringify(stores))
  const modified = Date.now()
  putObject({ module, stores, created, modified }, address)
}

export default function ({ model, address }) {
  const saveStore = el => async e => {
    e.preventDefault()
    const formData = new window.FormData(el)
    const name = formData.get('name')
    const address = await putObject({})
    delete model.makingNew
    model.stores.unshift({ name, address, created: Date.now() })
    saveModel(model, address)
  }
  const newStore = el => e => {
    model.makingNew = true
  }
  const cancelStore = el => e => {
    model.makingNew = false
  }
  return h`
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: DimGray;">
      <${input} placeholder="Find a repository..." style="margin-right: 21px"/>
      ${showIfElse(() => !model.makingNew, h`
        <div style="display: flex; justify-content: flex-end;">
          <${button} onclick=${newStore} style="margin-right: 21px;">
            ${octicons('repo-16', { style: 'padding-right: 4px;' })} 
            New
          </${button}>
        </div>
      `)}
      <div style = "flex-grow: 1; background: WhiteSmoke; overflow-y: scroll; overflow-x: auto" >
        ${showIfElse(() => model.makingNew, h`
          <form onsubmit=${saveStore}>
            <div style="display: flex; align-items: center;">
              <label style="display: flex; flex-grow: 1; align-items: center;">
                ${octicons('repo-16', { style: 'padding: 8px;' })} 
                <${input} name="name" placeholder="Repository Name" style="flex-grow: 1;" required/>
              </label>
              <${button} type="submit">
                ${octicons('north-star-16', { style: 'padding-right: 4px;' })} 
                Create
              </${button}>
              <${button} onclick=${cancelStore}>
                ${octicons('trashcan-16', { style: 'padding-right: 4px;' })} 
                Cancel
              </${button}>
            </div>
          </form>
        `)}
        ${mapEntries(model.stores, store => h`
          <${repo} store=${store}/>
        `)}
      </div>
    </div>
  `
}
