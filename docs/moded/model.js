import { proxy } from './horseless.0.5.3.min.esm.js' // '/unpkg/horseless/horseless.js'

export const unproxy = p => JSON.parse(JSON.stringify(p))

export function saveModel () {
  document.location.hash = JSON.stringify(model)
}

export const model = window.model = proxy({
  dimensions: { width: 0, height: 0 }
})


function setFromHash () {
  if (document.location.hash) {
    try {
      const hash = JSON.parse(unescape(document.location.hash.substring(1)))
      Object.assign(model, hash)
    } catch (err) {
      console.error(err)
    }
  }
}
setFromHash()
window.addEventListener('hashchange', setFromHash)
