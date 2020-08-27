import { render, h, proxy, watchFunction } from './horseless.js'
import { ObjectStoreWrapper } from './db.js'
import seeker from './components/seeker.js'

function removePrefix (prefix, str) {
  if (str.startsWith(prefix)) {
    return str.substr(prefix.length)
  }
  throw new Error(`string "${str}" doesn't start with prefix "${prefix}"`)
}

const model = window.model = proxy({})
function hashToModel () {
  const hash = window.location.hash.substr(1) || '0'
  console.log('starting with hash', hash)
  let prefix = ''
  const state = hash.split(':').map(substr => {
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
  model.state = state
  console.log('ending with model', JSON.stringify(model, null, '  '))
}
function modelToHash () {
  console.log('starting with model', JSON.stringify(model, null, '  '))
  let prefix = ''
  const hash = `#${model.state.map(statelet => {
    let substr = removePrefix(prefix, statelet.address)
    prefix = statelet.address
    if (statelet.expanded && statelet.expanded.length) {
      substr = `${substr};${statelet.expanded.map(v => removePrefix(prefix, v)).join(',')}`
    }
    return substr
  }).join(':')}`
  window.history.pushState(null, null, hash)
  console.log('ending with hash', hash)
}
window.onhashchange = hashToModel
window.onpopstate = hashToModel
hashToModel()
watchFunction(modelToHash)
/*
const objectStoreWrapper = new ObjectStoreWrapper(address)
render(document.body, h`
  <main style="display: flex; height: 100%;">
    <${seeker} objectStoreWrapper=${objectStoreWrapper}/>
  </main>
`)
*/