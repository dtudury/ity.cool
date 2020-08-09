import { model } from './model.js'

const dbPromise = new Promise((resolve, reject) => {
  Object.assign(window.indexedDB.open('crptptms'), {
    onupgradeneeded: function (event) {
      event.target.result.createObjectStore('repos')
      event.target.result.createObjectStore('data')
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

export async function createRandom () {
  const array = new Uint8Array(16)
  window.crypto.getRandomValues(array)
  let str = ''
  for (let i = 0; i < 16; i++) {
    str = str + String.fromCharCode(array[i])
  }
  const name = window.btoa(str)
  // const name = array.reduce((prev, curr) => prev + String.fromCharCode(curr), '')
  dbPromise.then(db => {
    Object.assign(db.transaction(['repos'], 'readwrite').objectStore('repos').put({}, name), {
      onsuccess: e => {
        syncList()
      },
      onerror: e => {
        console.error('error', e)
      }
    })
  })
}

export const deleteRepo = name => el => e => {
  e.stopPropagation()
  dbPromise.then(db => {
    Object.assign(db.transaction(['repos'], 'readwrite').objectStore('repos').delete(name), {
      onsuccess: e => {
        syncList()
      },
      onerror: e => {
        console.error('error', e)
      }
    })
  })
}

let nextSync
export async function syncList () {
  clearTimeout(nextSync)
  nextSync = false
  dbPromise.then(db => {
    Object.assign(db.transaction(['repos']).objectStore('repos').getAllKeys(), {
      onsuccess: function (event) {
        model.repoList = event.target.result
        nextSync = setTimeout(() => syncList(), 5000)
      }
    })
  })
}

export async function readRoot (name) {
  dbPromise.then(db => {
    Object.assign(db.transaction(['repos']).objectStore('repos').get(name), {
      onsuccess: function (event) {
        model.repos[name] = event.target.result
        nextSync = setTimeout(() => syncList(), 5000)
      }
    })
  })
}
