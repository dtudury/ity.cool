/* eslint-env browser */
import { code128Barcode } from './code128.js'
import { code39Barcode } from './code38.js'
import { render, h, proxy, watchFunction } from './horseless.0.5.4.min.esm.js'

const barcodeEncoders = {
  code39: code39Barcode,
  code128: code128Barcode
}

const updated = () => {
  const hashes = location.hash.split('#').filter(Boolean)
  let encoder = hashes.shift()
  if (!barcodeEncoders[encoder]) encoder = 'code39'
  const code = hashes.join('#')
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    encoder,
    code
  }
}

const model = window.model = proxy(updated())

watchFunction(() => history.replaceState(null, null, `#${model.encoder}#${model.code}`))

const barcode = el => {
  const x = model.width * 0.1
  const y = model.height * 0.1
  const width = model.width * 0.8
  const height = model.height * 0.8
  const encoder = barcodeEncoders[model.encoder] || barcodeEncoders.code128
  return encoder(model.code, x, y, width, height)
}

const update = () => Object.assign(model, updated())
update()
addEventListener('resize', update)
addEventListener('hashchange', update)

render(document.body, h`
  <svg width="100vw" height="100vh" style="display: block;" xmlns="http://www.w3.org/2000/svg">
    ${barcode}
  </svg>
`)
