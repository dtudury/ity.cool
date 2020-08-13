import { h, showIfElse } from './horseless.js'
import { putObject } from './db.js'
import octicons from './octicons.js'
import repo from './repo.js'
import input from './components/input.js'
import button from './components/button.js'
import { mapEntries } from '../esm/0.5.1.min.js'

export default function ({ model, address }) {
  const saveStores = e => {
    model.modified = Date.now()
    console.log(JSON.parse(JSON.stringify(model)), address)
    putObject(JSON.parse(JSON.stringify(model)), address)
  }
  const saveStore = el => async e => {
    e.preventDefault()
    const formData = new window.FormData(el)
    const name = formData.get('name')
    console.log(JSON.stringify(model))
    const objectAddress = await putObject({})
    delete model.makingNew
    model.stores.unshift([name, objectAddress, Date.now()])
    saveStores()
  }
  const newStore = el => e => {
    model.makingNew = true
  }
  const cancelStore = el => e => {
    model.makingNew = false
  }
  return h`
    <div style = "width: 100%; height: 100%; background: WhiteSmoke; overflow-y: scroll; overflow-x: auto" >
      <div style="display: flex; align-items: center;">
        <${input} placeholder="Find a repository..." style="flex-grow: 1;"/>
        <${button} onclick=${newStore}>
          ${octicons('repo-16', { style: 'padding-right: 4px;' })} 
          New
        </${button}>
      </div>
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
      ${mapEntries(model.stores, store => repo({ store }))}
    `
}
