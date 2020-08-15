import { h } from '../horseless.js'

export default function (attributes) {
  const model = attributes.model
  /*
  attributes.style = `
    font-size: inherit;
    border-radius: 6px;
    border: 1px solid black;
    padding: 2px 12px;
    margin: 6px;
  ` + (attributes.style || '')
  */
  if (model.module) {
    return h`
      <div ${attributes}>
        ${() => JSON.stringify(attributes)}
      </div>
    `
  } else {
    setTimeout(() => {
      model.module = './encryptedFolder.js'
    }, 1000)
    return h`
      fields to init folder
    `
  }
}
