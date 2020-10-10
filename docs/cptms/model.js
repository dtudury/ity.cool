import { proxy, watchFunction } from './horseless.js'
import { ObjectStoreWrapper } from './db.js'
import { encode, decode } from './codec.js'
const objectStoreWrapper = new ObjectStoreWrapper()
export const model = window.model = proxy({ files: {} })

model.get = function (address, lazy = false) {
  if (!model.files[address] || !model.files[address].requested) {
    model.files[address] = model.files[address] || {}
    if (!lazy) {
      model.files[address].requested = true
      objectStoreWrapper.getObject(address).then(data => {
        model.files[address].data = data
      })
    }
  }
  return model.files[address]
}

function deepSet (src, dest, key) {
  if (dest[key] && typeof src === typeof dest[key] && typeof src === 'object') {
    Object.getOwnPropertyNames(dest[key]).forEach(name => {
      if (!Object.prototype.hasOwnProperty.call(src, name)) {
        delete dest[key][name]
      }
    })
    Object.getOwnPropertyNames(src).forEach(name => deepSet(src[name], dest[key], name))
  } else {
    dest[key] = src
  }
}

function hashToModel () {
  const hash = window.location.hash || '#0'
  deepSet(decode(hash), model, 'state')
}

function modelToHash () {
  const hash = encode(model.state)
  if (window.location.hash !== hash) {
    if (window.location.hash) {
      window.history.pushState(null, null, hash)
    } else {
      window.history.replaceState(null, null, hash)
    }
  }
}

window.onhashchange = hashToModel
// window.onpopstate = hashToModel
hashToModel()
watchFunction(modelToHash)
