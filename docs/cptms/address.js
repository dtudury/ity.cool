
export function deprefix (s, prefix) {
  if (!s.startsWith(prefix)) {
    console.error('does not start with', s, prefix)
    throw new Error('does not start with')
  }
  return s.substr(prefix.length)
}

export function desuffix (s, suffix) {
  if (!s.endsWith(suffix)) {
    console.error('does not end with', s, suffix)
    throw new Error('does not end with')
  }
  return s.substr(0, s.length - suffix.length)
}

export function getParentAddress (address) {
  const lastDot = address.lastIndexOf('.')
  if (lastDot === -1) {
    return null
  }
  return address.substring(0, lastDot)
}
