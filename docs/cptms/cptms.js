import { render, h } from './horseless.js'
import { model } from './model.js'
import panel from './components/panel.js'
import dump from './_debug/dump.js'

render(document.body, h`
  <main style="display: flex; height: 100%;">
    <${panel} state=${model.state} model=${model}/>
  </main>
  ${dump(model)}
`)
