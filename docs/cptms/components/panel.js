import { h, mapEntries, showIfElse } from '../horseless.js'
import octicons from '../octicons.js'

function fileListItemView ({ data, model, select }, children, description) {
  return h`<div onclick=${el => select} style="border: 1px solid red;">
    ${showIfElse(() => model.expanded.indexOf(data.address) !== -1, octicons('chevron-down-16'), octicons('chevron-right-16'))}
    ${() => JSON.stringify(data.name)}
    ${showIfElse(() => model.selected === data.address, octicons('north-star-16'))}
  </div>`
}

export default function ({ panelIndex, model }, children, description) {
  const panel = model.uiPanels[panelIndex]
  if (!panel) return
  const file = model.get(panel.address)
  if (file.data) {
    const data = file.data
    return mapEntries(() => data.children, child => {
      const select = e => {
        console.log('select')
        if (panel.selected !== child.address) {
          panel.selected = child.address
          console.log(panelIndex)
          while (model.uiPanels.length > panelIndex) {
            model.uiPanels.pop()
          }
          model.uiPanels.push({ address: child.address, expanded: [] })
        }
      }
      return h`
        <${fileListItemView} 
          select=${el => select}
          data=${child}
          model=${panel}
        />
      `
    })
  }
}
