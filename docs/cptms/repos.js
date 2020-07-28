let repos
export default function ({ h }) {
  repos = repos || h`<div>asdf</div>`
  return repos
}

export function foo () {
  return 'bar'
}
