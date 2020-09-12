import { render, h, mapEntries } from './horseless.js'
import { model } from './model.js'
import panel from './components/panel.js'
import dump from './_debug/dump.js'

render(document.body, h`
  <main style="display: flex; height: 100%;">
    ${mapEntries(() => model.uiPanels, (_, index) => h`
      <section style="flex: 1 0 20em; overflow-y: scroll;">
        <${panel} panelIndex=${index} model=${model}/>
      </section>
    `)}
  </main>
  ${dump(model)}
`)
