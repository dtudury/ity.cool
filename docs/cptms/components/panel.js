import { h, mapEntries, showIfElse } from '../horseless.js'
import octicons from '../octicons.js'

function fileListItemView ({ child, uiPanels, select }, children, description) {
  return h`<div onclick=${el => select} style="border: 1px solid red;">
    ${showIfElse(() => uiPanels.expanded.indexOf(child.address) !== -1, octicons('chevron-down-16'), octicons('chevron-right-16'))}
    ${() => JSON.stringify(child.name)}
    ${showIfElse(() => uiPanels.selected === child.address, octicons('north-star-16'))}
  </div>`
}

export default function panel ({ uiPanels, model }, children, description) {
  if (uiPanels && uiPanels.address) {
    const file = model.get(uiPanels.address)
    console.log(uiPanels.address)
    console.log(file.data)
    if (file.data) {
      const data = file.data
      return h`
        <section style="flex: 1 0 20em; overflow-y: scroll;">
          ${mapEntries(() => data.children, child => {
        const select = el => e => {
          console.log('select', child)
          uiPanels.selected = {
            address: child.address,
            expanded: []
          }
        }
        return h`
              <${fileListItemView}
                select=${select}
                child=${child}
                uiPanels=${uiPanels}
              />
            `
      })}
        </section>
        <${panel} uiPanels=${uiPanels.selected} model=${model}/>
      `
    }
  }
}
