import { h, showIfElse, mapEntries } from '../horseless.js'
import dynamic from './dynamic.js'
import octicons from '../octicons.js'
import input from './input.js'
import button from './button.js'

export default function ({ model, objectStoreWrapper }) {
  function saveSelf ({ repos, nextChild, created }) {
    repos = repos.map(repo => ({ name: repo.name, address: repo.address }))
    const modified = Date.now()
    objectStoreWrapper.putObject({ repos, nextChild, created, modified })
  }
  model.repos = []
  model.created = Date.now()
  model.nextChild = 0
  objectStoreWrapper.getObject().then(result => {
    Object.assign(model, result)
  })
  const createRepo = el => async e => {
    e.preventDefault()
    const name = model.input
    delete model.input
    const repoAddress = objectStoreWrapper.key + '.' + model.nextChild
    ++model.nextChild
    // await objectStoreWrapper.addObject({ created: Date.now() }, repoAddress)
    model.repos.unshift({ name, address: repoAddress })
    saveSelf(model)
  }
  const cancelInput = el => e => {
    delete model.input
  }
  const handleInput = el => e => {
    console.log('input!')
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
        repo.data = await objectStoreWrapper.getObject(repo.address)
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
        ${showIfElse(() => repo.data, octicons('chevron-down-16', { style: 'padding-right: 4px;' }), octicons('chevron-right-16', { style: 'padding-right: 4px;' }))}
        ${octicons('repo-16', { style: 'padding-right: 4px;' })} 
        <span style="flex-grow: 1">
          ${() => repo.name}
        </span>
      </div>
      ${() => {
        if (repo.data) {
          return h`
            <${dynamic} 
              module="${() => repo.data.module || './encryptedRepo.js'}" 
              model=${repo.data} 
              objectStoreWrapper=${objectStoreWrapper.clone(repo.address)}
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
          <${input} id="multibox" oninput=${handleInput} value=${() => model.input || ''} placeholder="Filter/Create a Repository..." style="flex-grow: 1;"/>
        </label>
        ${showIfElse(() => model.input, h`
          <${button} onclick=${createRepo}>
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
