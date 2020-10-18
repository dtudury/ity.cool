import { deprefix, desuffix } from './address.js'

export function encode (o, prefix = '') {
  function _transformExpanded (expanded, prefix) {
    const transformed = {}
    for (const item of expanded) {
      transformed[deprefix(item.address, prefix)] = _transformExpanded(item.expanded || [], item.address + '.')
    }
    return transformed
  }
  function _encodeExpanded (expanded, selectedPath, selected) {
    let str = ''
    const firstSelected = selectedPath[0]
    const keys = Object.keys(expanded).sort((a, b) => {
      if (selectedPath.length > 1) {
        if (a === firstSelected) return 1
        if (b === firstSelected) return -1
      }
      return a - b
    })
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      str += key
      let inner
      if (firstSelected === key) {
        inner = _encodeExpanded(expanded[key], selectedPath.slice(1), selected)
      } else {
        inner = _encodeExpanded(expanded[key], [])
      }
      if (inner) {
        str += `(${inner})`
      } else if (i !== keys.length - 1) {
        str += ','
      }
    }
    if (selected && selectedPath.length === 1) {
      str += encode(selected, desuffix(selected.address, selectedPath[0]))
    }
    return str
  }
  let encoded = '#'
  const expanded = _transformExpanded([o], prefix)
  let selected = []
  if (o.selected && o.selected.address) {
    selected = deprefix(o.selected.address, prefix).split('.')
  }
  encoded += _encodeExpanded(expanded, selected, o.selected)
  return encoded
}

export function decode (s) {
  const panels = []
  let pos = 0
  function _match (c) {
    return s.charAt(pos).match(c)
  }
  function _assert (c) {
    if (!_match(c)) {
      console.error('does not match', s.charAt(pos), c)
      throw new Error('does not match')
    }
    ++pos
  }
  function _decodeNumber () {
    let sub = ''
    while (s.charAt(pos).match(/\d/)) {
      sub = sub + s.charAt(pos)
      ++pos
    }
    if (!sub) {
      console.error('no number', s, pos)
      throw new Error('no number')
    }
    if (Number.isNaN(Number(sub))) {
      console.error('not a number', sub, s, pos)
      throw new Error('not a number')
    }
    return Number(sub)
  }
  function _decodeExpanded (prefix) {
    if (_match(/\(/)) {
      ++pos
      const expanded = []
      while (!_match(/\)/)) {
        if (_match('#')) {
          _decodePanel(prefix)
        } else {
          const v = _decodeNumber()
          const item = _decodeExpanded(prefix + v + '.')
          expanded.push({ address: prefix + v, expanded: item })
        }
      }
      ++pos
      return expanded
    }
    if (_match(',')) {
      ++pos
      return []
    }
    return []
  }
  function _decodePanel (prefix) {
    const panel = {}
    _assert('#')
    panel.address = prefix + _decodeNumber()
    panel.expanded = _decodeExpanded(panel.address + '.')
    panels.push(panel)
  }
  _decodePanel('')
  while (panels.length > 1) {
    const topPanel = panels.shift()
    panels[0].selected = topPanel
  }
  return panels[0]
}

const encoded1 = '#0(0,2,1(1,2(1#1(0,1(2)#0(1)))))'
// const encoded1 = '#0(#1)'
console.log(encoded1)
const decoded1 = decode(encoded1)
console.log(JSON.stringify(decoded1, null, '  '))
const encoded2 = encode(decoded1)
console.log(encoded1)
console.log(encoded2)
console.log(encoded1 === encoded2)
