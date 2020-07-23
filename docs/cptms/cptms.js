import * as horseless from './horseless.0.5.1.min.esm.js'
// import { h, render, proxy } from '/unpkg/horseless/horseless.js'

const model = horseless.proxy({
  module: './repos.js',
  inner: {}
})

const handleResize = e => {
  model.inner.width = window.innerWidth
  model.inner.height = window.innerHeight
}
window.addEventListener('resize', handleResize)
handleResize()

const unbox = attr => {
  const copy = Object.assign({}, attr, {
    x: 0.5 + Number(attr.left),
    y: 0.5 + Number(attr.top),
    width: attr.right - attr.left - 1,
    height: attr.bottom - attr.top - 1
  })
  delete copy.left
  delete copy.right
  delete copy.top
  delete copy.bottom
  return copy
}

let reposRect
const reposModel = horseless.proxy({})
function repos (attr) {
  Object.assign(reposModel, attr)
  reposRect = reposRect || horseless.h`<rect ${unbox(attr)}/>`
  return reposRect
}

let filesRect
const filesModel = horseless.proxy({})
function files (attr) {
  Object.assign(filesModel, attr)
  filesRect = filesRect || horseless.h`<rect ${() => unbox(filesModel)}/>`
  return filesRect
}

let contentRect
const contentModel = horseless.proxy({})
function content (attr) {
  Object.assign(contentModel, attr)
  contentRect = contentRect || horseless.h`<rect ${() => unbox(contentModel)}/>`
  return contentRect
}

let actual
function container (attr) {
  const placeholder = ['white', 'whitesmoke', 'gainsboro', 'lightgray', 'silver', 'darkgray', 'gray', 'dimgray', 'black'].map((color, index) => {
    return horseless.h`<rect x="0" y="${index * 25}" width="20" height="20" fill="${color}"/>`
  })
  if (attr.model.module) {
    import(attr.model.module).then(module => {
      actual = module.default(horseless)
      attr.model.loaded = true
    })
  }
  return () => {
    if (attr.model.loaded) {
      return actual
    } else {
      return placeholder
    }
  }
}

const right = offset => () => model.inner.width + offset
const reposRight = offset => () => Math.round(200 + offset)
const filesRight = offset => () => Math.round((model.inner.width + reposRight(0)()) / 2 + offset)
const bottom = offset => () => model.inner.height + offset
horseless.render(document.body, horseless.h`
  <svg viewBox="0 0 ${right(0)} ${bottom(0)}" xmlns="http://www.w3.org/2000/svg">
    <${repos} left="10" top="10" right=${reposRight(-5)} bottom=${bottom(-10)} rx="4"/>
    <${files} left=${reposRight(5)} top="10" right=${filesRight(-5)} bottom=${bottom(-10)} rx="4"/>
    <${content} left=${filesRight(5)} top="10" right=${right(-10)} bottom=${bottom(-10)} rx="4"/>
    <${container} model=${model}/>
  </svg>
`)
