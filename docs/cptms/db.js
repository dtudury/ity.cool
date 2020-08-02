
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

export async function createRandom () {
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

export async function syncList (model) {
  dbPromise.then(db => {
    Object.assign(db.transaction(['repos']).objectStore('repos').getAllKeys(), {
      onsuccess: function (event) {
        const newList = new Set(event.target.result)
        const oldList = new Set(model.repoList)
        model.repoList = event.target.result
        newList.forEach(repoName => {
          model.repoMap[repoName] = model.repoMap[repoName] || { expanded: false, updated: false }
          oldList.delete(repoName)
        })
        oldList.forEach(repoName => {
          delete model.repoMap[repoName]
        })
        setTimeout(() => syncList(model), 1000)
      }
    })
  })
}

export const deleteRepo = name => el => e => {
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
