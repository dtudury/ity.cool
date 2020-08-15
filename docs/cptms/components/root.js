import { h, showIfElse, watchFunction, mapEntries } from '../horseless.js'
import { putObject, getObject } from '../db.js'
import dynamic from './dynamic.js'
import octicons from '../octicons.js'
import input from './input.js'
import button from './button.js'

function saveModel ({ module, repos, created }, address) {
  repos = JSON.parse(JSON.stringify(repos))
  const modified = Date.now()
  putObject({ module, repos, created, modified }, address)
}

export default function ({ model, address }) {
  model.module = model.module || './root.js'
  model.repos = model.repos || []
  model.created = model.created || Date.now()
  watchFunction(() => {
    const value = model.input || ''
    const multibox = document.querySelector('#multibox')
    if (multibox) {
      multibox.value = value
    }
  })
  const saveRepo = el => async e => {
    e.preventDefault()
    const name = model.input
    delete model.input
    const repoAddress = await putObject({})
    model.repos.unshift({ name, address: repoAddress, created: Date.now() })
    saveModel(model, address)
  }
  const cancelInput = el => e => {
    delete model.input
  }
  const handleInput = el => e => {
    if (e.target.value) model.input = e.target.value
    else delete model.input
  }
  function filterRepos () {
    if (!model.input) return model.repos
    else return model.repos
  }
  function repoMapper (repo) {
    const toggleRepo = el => async e => {
      if (!repo.data) {
        repo.data = 'loading'
        repo.data = getObject(repo.address)
      } else if (repo.data !== 'loading') delete repo.data
    }
    return h`
      <div 
        style="
          display: flex; 
          align-items: center; 
          border-bottom: 1px solid DimGray; 
          background: DarkGray; 
          cursor: pointer;
        " 
        onclick=${toggleRepo}
      >
        ${showIfElse(() => repo.data, octicons('chevron-down-16', { style: 'padding: 8px;' }), octicons('chevron-right-16', { style: 'padding: 8px;' }))}
        ${octicons('repo-16', { style: 'padding: 8px;' })} 
        <span style="flex-grow: 1">
          ${() => repo.name}
        </span>
        <span style="color: Gray; padding-right: 6px;">
          ${() => new Date(repo.created).toLocaleString()}
        </span>
      </div>
      ${() => {
        if (repo.data) {
          return h`
            <${dynamic} 
              module="${() => repo.module || './encryptedFolder.js'}" 
              model=${repo} 
            />
          `
        }
      }}
    `
  }
  return h`
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: DimGray;">
      <div style="display: flex; align-items: center; margin-right: 21px;">
        <label style="display: flex; flex-grow: 1; align-items: center;">
          ${octicons('repo-16', { style: 'padding: 8px;' })} 
          <${input} id="multibox" oninput=${handleInput} placeholder="Filter/Create a Repository..." style="flex-grow: 1;"/>
        </label>
        ${showIfElse(() => model.input, h`
          <${button} onclick=${saveRepo}>
            ${octicons('north-star-16', { style: 'padding-right: 4px;' })} 
            Create
          </${button}>
          <${button} onclick=${cancelInput} style="padding: 2px 4px;">
            ${octicons('x-16')}
          </${button}>
        `)}
      </div>

      <div style = "flex-grow: 1; background: WhiteSmoke; overflow-y: scroll; overflow-x: auto" >
        ${mapEntries(filterRepos, repoMapper)}
      </div>
    </div>
  `
}
