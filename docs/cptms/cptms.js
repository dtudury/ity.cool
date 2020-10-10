import { render, h, watchFunction } from './horseless.js'
import { model } from './model.js'
import panel from './components/panel.js'
import dump from './_debug/dump.js'

watchFunction(() => {
  console.log(model.focus)
  if (model.focus) {
    document.getElementById(model.focus).scrollIntoView({ behavior: 'smooth' })
  }
})

render(document.body, h`
  <main style="display: flex; height: 100%;">
    <${panel} state=${model.state} model=${model}/>
  </main>
  ${dump(model)}
`)
