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
  constructor (defaultKey = 0, encryptionFunction, decryptionFunction) {
    this.defaultKey = defaultKey
    this.encryptionFunction = encryptionFunction
    this.decryptionFunction = decryptionFunction
  }

  clone (newDefaultKey, encryptionFunction = this.encryptionFunction, decryptionFunction = this.decryptionFunction) {
    return new ObjectStoreWrapper(newDefaultKey, encryptionFunction, decryptionFunction)
  }

  async getObject (key = this.defaultKey) {
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

  async putObject (object, key = this.defaultKey) {
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

  async addObject (object, key) {
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
