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

export class ObjectStoreWrapper {
  constructor (key, encryptionFunction, decryptionFunction) {
    this.key = key
    this.encryptionFunction = encryptionFunction
    this.decryptionFunction = decryptionFunction
  }

  clone (key, encryptionFunction = this.encryptionFunction, decryptionFunction = this.decryptionFunction) {
    return new ObjectStoreWrapper(key, encryptionFunction, decryptionFunction)
  }

  getObject (key = this.key) {
    return dbPromise.then(db => new Promise((resolve, reject) => {
      Object.assign(db.transaction(['data']).objectStore('data').get(key), {
        onsuccess: event => {
          let object = event.target.result
          if (this.decryptionFunction) {
            object = this.decryptionFunction(object)
          }
          resolve(object)
        },
        onerror: reject
      })
    }))
  }

  putObject (object, key = this.key) {
    if (this.encryptionFunction) {
      object = this.encryptionFunction(object)
    }
    return dbPromise.then(db => new Promise((resolve, reject) => {
      Object.assign(db.transaction(['data'], 'readwrite').objectStore('data').put(object, key), {
        onsuccess: event => {
          resolve(event.target.result)
        },
        onerror: reject
      })
    }))
  }

  addObject (object, key) {
    if (this.encryptionFunction) {
      object = this.encryptionFunction(object)
    }
    return dbPromise.then(db => new Promise((resolve, reject) => {
      Object.assign(db.transaction(['data'], 'readwrite').objectStore('data').add(object, key), {
        onsuccess: event => {
          resolve(event.target.result)
        },
        onerror: reject
      })
    }))
  }
}
