import { h, mapEntries } from '../horseless.js'

export function jsonDump ({ obj }, children, description) {
  if (Array.isArray(obj)) {
    return h`[${mapEntries(() => obj, (value, name) => {
      return h`<div style="margin-left: 5px;">${name}: ${jsonDump(value)}</div>`
    })}]`
  } else if (typeof obj === 'object') {
    return h`{${mapEntries(() => obj, (value, name) => {
      return h`<div style="margin-left: 5px;">${name}: ${jsonDump(value)}</div>`
    })}}`
  } else {
    return h`${() => obj}`
  }
}
