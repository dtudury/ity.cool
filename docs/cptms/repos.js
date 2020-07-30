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
      <div>
        <span onclick=${toggleExpanded(content)}>
          ${() => content.expanded ? octicons('chevron-down-16') : octicons('chevron-right-16')}
          ${name}
        </span>
        <span onclick=${deleteRepo(name)}>delete</span>
        <${dynamic} module="./repo.js" model=${content}/>
      </div>
    `
  }
  return h`
    <div onclick=${el => createRandom}>${octicons('repo-16')} New</div>
    ${mapEntries(() => model.repoList, nameToRepo)}
  `
}
