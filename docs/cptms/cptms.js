import { render, h, watchFunction } from './horseless.js'
import { model } from './model.js'
import panel from './components/panel.js'
import dump from './_debug/dump.js'

watchFunction(() => {
  console.log(model.focus)
  if (model.focus) {
    const focused = document.getElementById(model.focus)
    if (focused) {
      focused.scrollIntoView({ behavior: 'smooth' })
    } else {
      console.error('no focus for', model.focus, '(TODO: fix this)')
    }
  }
})

render(document.body, h`
  <main style="display: flex; height: 100%;">
    <${panel} state=${model.state}/>
  </main>
  ${dump(model)}
`)
