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
  const salt = new Uint8Array(16)
  window.crypto.getRandomValues(salt)
  let str = ''
  for (let i = 0; i < 16; i++) {
    str = str + String.fromCharCode(salt[i])
  }
  const name = window.btoa(str)
  dbPromise.then(db => {
    Object.assign(db.transaction(['repos'], 'readwrite').objectStore('repos').put({
      module: './repo.js',
      salt,
      iterations: 25000
    }, name), {
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
        event.target.result.forEach((value, index) => {
          model.repoList[index] = value
        })
        model.repoList.splice(event.target.result.length)
        nextSync = setTimeout(() => syncList(), 5000)
      }
    })
  })
}
syncList()

export async function readRoot (name) {
  dbPromise.then(db => {
    Object.assign(db.transaction(['repos']).objectStore('repos').get(name), {
      onsuccess: function (event) {
        model.repos[name] = event.target.result
      }
    })
  })
}
