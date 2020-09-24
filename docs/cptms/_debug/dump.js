import { h, mapEntries } from '../horseless.js'

export default function dump (obj) {
  if (Array.isArray(obj)) {
    return h`[${mapEntries(() => obj, (value, name) => {
      return h`<div style="margin-left: 3em;">${name}: ${dump(value)}</div>`
    })}]`
  } else if (typeof obj === 'object') {
    return h`{${mapEntries(() => obj, (value, name) => {
      return h`<div style="margin-left: 3em;">${name}: ${dump(value)}</div>`
    })}}`
  } else if (typeof obj === 'function') {
    return '[function]'
  } else {
    return h`${() => obj}`
  }
}
