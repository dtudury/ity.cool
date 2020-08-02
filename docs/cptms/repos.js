import { h, mapEntries } from './horseless.js'
import octicons from './octicons.js'
import { dynamic } from './nodes.js'
import { syncList, deleteRepo, createRandom } from './db.js'

const toggleExpanded = model => el => e => {
  model.expanded = !model.expanded
}
export default function ({ model }) {
  model.repoMap = model.repoMap || {}
  syncList(model)
  function nameToRepo (name) {
    const content = model.repoMap[name]
    return h`
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span onclick=${toggleExpanded(content)} style="display: inline-flex; align-items: center;">
          ${() => content.expanded ? octicons('chevron-down-16') : octicons('chevron-right-16')}
          ${name}
        </span>
        <span style="display: inline-flex; align-items: center;">
          <span onclick=${deleteRepo(name)}>${octicons('pencil-16')}</span>
          <span onclick=${deleteRepo(name)}>${octicons('trashcan-16')}</span>
        </span>
      </div>
      <${dynamic} module="./repo.js" model=${content}/>
    `
  }
  return h`
    <div onclick=${el => createRandom}>${octicons('repo-16')} New</div>
    ${mapEntries(() => model.repoList, nameToRepo)}
  `
}
