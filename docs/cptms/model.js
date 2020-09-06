import { proxy, watchFunction } from './horseless.js'
import { ObjectStoreWrapper } from './db.js'
const osw = new ObjectStoreWrapper()
export const model = window.model = proxy({ data: {} })

model.get = function (address) {
  if (!model.data[address]) {
    model.data[address] = {}
    osw.getObject(address).then(data => {
      console.log(data)
      model.data[address] = data
    })
  }
  return model.data[address]
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

function removePrefix (prefix, str) {
  if (str.startsWith(prefix)) {
    return str.substr(prefix.length)
  }
  throw new Error(`string "${str}" doesn't start with prefix "${prefix}"`)
}

function hashToModel () {
  const hash = window.location.hash.substr(1) || '0'
  console.log('starting with hash', window.location.hash)
  let prefix = ''
  const uiPanels = hash.split(':').map(substr => {
    const [addressSuffix, expandedSuffices] = substr.split(';')
    const address = `${prefix}${addressSuffix}`
    prefix = address
    if (expandedSuffices) {
      const expanded = expandedSuffices.split(',').map(v => `${prefix}${v}`)
      return { address, expanded }
    } else {
      return { address }
    }
  })
  for (let i = 0; i < uiPanels.length - 1; i++) {
    uiPanels[i].selected = uiPanels[i + 1].address
  }
  deepSet(uiPanels, model, 'uiPanels')
  console.log('ending with model', JSON.stringify(model, null, '  '))
}

function modelToHash () {
  console.log('starting with model', JSON.stringify(model, null, '  '))
  let prefix = ''
  const hash = `#${model.uiPanels.map(panel => {
    let substr = removePrefix(prefix, panel.address)
    prefix = panel.address
    if (panel.expanded && panel.expanded.length) {
      substr = `${substr};${panel.expanded.map(v => removePrefix(prefix, v)).join(',')}`
    }
    return substr
  }).join(':')}`
  if (window.location.hash !== hash) {
    window.history.pushState(null, null, hash)
  }
  console.log('ending with hash', hash)
}

window.onhashchange = hashToModel
// window.onpopstate = hashToModel
hashToModel()
watchFunction(modelToHash)
