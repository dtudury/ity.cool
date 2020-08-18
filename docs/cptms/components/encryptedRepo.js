import { h } from '../horseless.js'
import input from './input.js'
import button from './button.js'
import octicons from '../octicons.js'
import fileDirectory from './fileDirectory.js'

export default function ({ model, saveRepo }) {
  const initialize = el => async e => {
    e.preventDefault()
    const formData = new window.FormData(el)
    const passphrase = new TextEncoder().encode(formData.get('passphrase'))
    let iterations = model.iterations
    let salt = model.salt
    if (!iterations || !salt) {
      iterations = Number(formData.get('iterations'))
      salt = window.crypto.getRandomValues(new Uint8Array(32))
      await saveRepo({ iterations, salt, module: './encryptedRepo.js', created: model.created })
    }
    const keyMaterial = await window.crypto.subtle.importKey('raw', passphrase, { name: 'PBKDF2' }, false, ['deriveKey'])
    model.key = await window.crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
    )
    model.iterations = iterations
    model.salt = salt
  }
  if (model.key) {
    return h`<${fileDirectory} 
    />`
  } else if (model.salt && model.iterations) {
    return h`
      <form onsubmit=${initialize} style="background: silver;">
        <div style="display: flex; align-items: center; font-weight: bold;">
          ${octicons('lock-16', { style: 'padding: 8px;' })} 
          Open Repository:
        </div>
        <label style="display:flex; align-items: center;">
          ${octicons('key-16', { style: 'padding: 8px;' })} 
          Passphrase:
          <${input} name="passphrase" type="password" style="flex-grow: 1;" required/>
        </label>
        <div style="display: flex; align-items: center; justify-content: flex-end;">
          <${button} type="submit">${octicons('unlock-16', { style: 'padding-right: 4px;' })} Decrypt</button>
        </div>
      </form>
    `
  } else {
    return h`
      <form onsubmit=${initialize} style="background: silver;">
        <div style="display: flex; align-items: center; font-weight: bold;">
          ${octicons('dot-16', { style: 'padding: 8px;' })} 
          Initialize Repository:
        </div>
        <label style="display:flex; align-items: center;">
          ${octicons('key-16', { style: 'padding: 8px;' })} 
          Passphrase:
          <${input} name="passphrase" type="password" style="flex-grow: 1;" required/>
        </label>
        <label style="display:flex; align-items: center;">
          ${octicons('gear-16', { style: 'padding: 8px;' })} 
          Iterations:
          <${input} name="iterations" type="number" defaultValue="20000" style="flex-grow: 1;"/>
        </label>
        <div style="display: flex; align-items: center; justify-content: flex-end;">
          <${button} type="submit">${octicons('shield-lock-16', { style: 'padding-right: 4px;' })} Set Up Encryption</button>
        </div>
      </form>
    `
  }
}
