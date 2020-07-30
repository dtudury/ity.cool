import { h, mapEntries } from './horseless.js'
import octicons from './octicons.js'
import { dynamic } from './nodes.js'

const dbPromise = new Promise((resolve, reject) => {
  Object.assign(window.indexedDB.open('crptptms'), {
    onupgradeneeded: function (event) {
      event.target.result.createObjectStore('repos')
    },
    onsuccess: function (event) {
      resolve(event.target.result)
    },
    onerror: function (event) {
      console.error(event)
      reject(event)
    }
  })
})

async function createRandom () {
  const name = 'temp_' + ('0000000000000000' + (Math.random() * 0x10000000000000).toString(16).toUpperCase()).substr(-16)
  dbPromise.then(db => {
    Object.assign(db.transaction(['repos'], 'readwrite').objectStore('repos').put(['asdf', new ArrayBuffer(10)], name), {
      onsuccess: e => {
        console.log(e)
      },
      onerror: e => {
        console.error('error', e)
      }
    })
  })
}

async function syncList (model) {
  dbPromise.then(db => {
    Object.assign(db.transaction(['repos']).objectStore('repos').getAllKeys(), {
      onsuccess: function (event) {
        const newList = new Set(event.target.result)
        const oldList = new Set(Object.keys(model.repoList))
        newList.forEach(repoName => {
          model.repoList[repoName] = model.repoList[repoName] || { expanded: false, updated: false }
          oldList.delete(repoName)
        })
        oldList.forEach(repoName => {
          delete model.repoList[repoName]
        })
        setTimeout(() => syncList(model), 0)
      }
    })
  })
}

const deleteRepo = name => el => e => {
  dbPromise.then(db => {
    Object.assign(db.transaction(['repos'], 'readwrite').objectStore('repos').delete(name), {
      onsuccess: e => {
        console.log(e)
      },
      onerror: e => {
        console.error('error', e)
      }
    })
  })
}
const toggleExpanded = model => el => e => {
  model.expanded = !model.expanded
}
function sortObject (o) {
  return Object.fromEntries(Object.entries(o).sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
}
export default function ({ model }) {
  model.repoList = model.repoList || {}
  syncList(model)
  return h`
    <div onclick=${el => createRandom}>${octicons('repo-16')} New</div>
    ${mapEntries(() => sortObject(model.repoList), (content, name) => h`
      <div>
        <span onclick=${toggleExpanded(content)}>
          ${() => content.expanded ? octicons('chevron-down-16') : octicons('chevron-right-16')}
          ${name}
        </span>
        <span onclick=${deleteRepo(name)}>delete</span>
        <${dynamic} module="./repo.js" model=${content}/>
      </div>
    `)}
  `
}
