import { h } from './horseless.js'

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
  const method = 'add'
  const name = 'r' + Math.random()
  dbPromise.then(db => {
    Object.assign(db.transaction(['repos'], 'readwrite').objectStore('repos')[method]('asdf', name), {
      onsuccess: e => {
        console.log(e)
      },
      onerror: e => {
        console.error('error', e)
      }
    })
  })
}

async function getList () {
  dbPromise.then(db => {
    Object.assign(db.transaction(['repos']).objectStore('repos').getAllKeys(), {
      onsuccess: function (event) {
        console.log(event.target.result)
        createRandom()
      }
    })
  })
}

export default function ({ model }) {
  getList()
  return h`<div>asdf ${() => model.position.width}</div>`
}
