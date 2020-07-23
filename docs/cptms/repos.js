let repos
export default function ({ h }) {
  console.log(h)
  repos = repos || h`<rect x="0" y="0" width="200" height="200" fill="pink"/>`
  return repos
}

export function foo () {
  return 'bar'
}
