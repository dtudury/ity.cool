import { h, proxy, mapEntries } from './horseless.js'
import octicons from './octicons.js'
import { dynamic } from './nodes.js'
import { deleteRepo, createRandom, readRoot } from './db.js'

const onclick = (model, name) => el => e => {
  if (model.repos[name]) {
    delete model.repos[name]
  } else {
    readRoot(name)
  }
}
const onmouseover = uiState => el => e => {
  uiState.hover = true
}
const onmouseout = uiState => el => e => {
  uiState.hover = false
}
const oncontextmenu = uiState => el => e => {
  console.log('context menu')
}
export default function ({ model }) {
  function nameToRepo (name) {
    const uiState = proxy({ expanded: false, hover: false })
    return h`
      <div 
        onmouseover=${onmouseover(uiState)} 
        onmouseout=${onmouseout(uiState)} 
        oncontextmenu=${oncontextmenu(uiState)} 
        onclick=${onclick(model, name)} 
        style="
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          background: ${() => uiState.hover ? 'AliceBlue' : 'LightGray'}
        "
      >
        <span 
          style="display: inline-flex; align-items: center;"
        >
          ${() => model.repos[name] ? octicons('chevron-down-16') : octicons('chevron-right-16')}
          ${name}
        </span>
        <span style="display: inline-flex; align-items: center;">
          <button style="padding: 0; border: none; background: none;" onclick=${deleteRepo(name)}>${octicons('pencil-16')}</button>
          <button style="padding: 0; border: none; background: none;" onclick=${deleteRepo(name)}>${octicons('trashcan-16')}</button>
        </span>
      </div>
      ${() => {
        const repo = model.repos[name]
        if (repo && repo.module) {
          return h`<${dynamic} module=${repo.module} name=${name} model=${repo}/>`
        }
      }}
    `
  }
  return h`
      < div style = "width: 300px; height: 100%; background: WhiteSmoke; overflow-y: scroll; overflow-x: auto" >
        <div onclick=${el => createRandom}>${octicons('repo-16')} New</div>
    ${mapEntries(() => model.repoList, nameToRepo)}
    </div >
      `
}
