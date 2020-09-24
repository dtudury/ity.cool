export function encode (o, prefix = '') {
  function _deprefix (s) {
    if (!s.startsWith(prefix)) {
      console.error('does not start with', s, prefix)
      throw new Error('does not start with')
    }
    return s.substr(prefix.length)
  }
  function _encodeExpanded (expanded, prefix) {

  }
  let encoded = '#' + _deprefix(o.address)
  encoded += _encodeExpanded(o.expanded, o.address + '.')
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

const encoded1 = '#0(0,1(1,2(#1)))'
console.log(encoded1)
const decoded1 = decode(encoded1)
console.log(JSON.stringify(decoded1, null, '  '))
const encoded2 = encode(decoded1)
console.log(encoded2)
