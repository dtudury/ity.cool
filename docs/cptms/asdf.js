let repos
export default function ({ h }, ...rest) {
  console.log(rest)
  repos = repos || h`<div>qwerty</div>`
  return repos
}
