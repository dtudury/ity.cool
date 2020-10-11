import { h, mapEntries, showIfElse } from '../horseless.js'
import octicons from '../octicons.js'

function fileListItemView ({ child, state, select, selected }, children, description) {
  const isExpanded = () => state.expanded.some(({ address }) => address === child.address)
  const chevronDown = octicons('chevron-down-16', el => ({
    onclick: e => {
      e.stopPropagation()
      console.log('close')
      for (let i = state.expanded.length - 1; i >= 0; i--) {
        if (state.expanded[i].address === child.address) {
          state.expanded.splice(i, 1)
        }
      }
    }
  }))
  const chevronRight = octicons('chevron-right-16', el => ({
    onclick: e => {
      e.stopPropagation()
      console.log('open')
      state.expanded.push({
        address: child.address,
        expanded: []
      })
      console.log(JSON.parse(JSON.stringify(state)))
    }
  }))
  return h`
    <div onclick=${el => select} style="border: 1px solid red;">
      ${showIfElse(isExpanded, chevronDown, chevronRight)}
      ${() => JSON.stringify(child.name)}
      ${showIfElse(() => state.selected && state.selected.address === child.address, octicons('north-star-16'))}
    </div>
    ${showIfElse(isExpanded, h`
      open
    `)}
  `
}

const fileListViews = new Map()
function fileListView ({ state, model, indent }, children, description) {
  const file = model.get(state.address)
  const data = file.data
  if (data) {
    model.focus = state.address
  }
  const select = child => el => e => {
    state.selected = state.selected || {}
    state.selected.address = child.address
    state.selected.expanded = []
  }
  if (!fileListViews.has(description)) {
    fileListViews.set(description, showIfElse(() => model.get(state.address).data, h`
      ${mapEntries(() => model.get(state.address).data.children, child => h`
        <${fileListItemView}
          select=${select(child)}
          child=${child}
          state=${state}
          indent=${indent}
        />
      `)}
    `, 'loading...'))
  }
  return fileListViews.get(description)
}

const panels = new Map()
export default function panel ({ state, model }, children, description) {
  if (state && state.address) {
    if (!panels.has(description)) {
      panels.set(description, h`
        <section id=${() => state.address} style="flex: 1 0 20em; overflow-y: scroll;">
          <${fileListView}
            state=${() => state}
            model=${model}
            indent=${0}
          />
        </section>
        <${panel} state=${() => state.selected} model=${model}/>
      `)
    }
    return panels.get(description)
  }
}
