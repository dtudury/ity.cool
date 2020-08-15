const dbPromise = new Promise((resolve, reject) => {
  Object.assign(window.indexedDB.open('crptptms'), {
    onupgradeneeded: function (event) {
      event.target.result.createObjectStore('data', { autoIncrement: true })
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

export async function getObject (key = 0) {
  return dbPromise.then(db => new Promise((resolve, reject) => {
    Object.assign(db.transaction(['data']).objectStore('data').get(key), {
      onsuccess: event => {
        resolve(event.target.result)
      },
      onerror: reject
    })
  }))
}

export async function putObject (object, key) {
  return dbPromise.then(db => new Promise((resolve, reject) => {
    Object.assign(db.transaction(['data'], 'readwrite').objectStore('data').put(object, key), {
      onsuccess: event => {
        resolve(event.target.result)
      },
      onerror: reject
    })
  }))
}
