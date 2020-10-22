import { h, mapEntries, showIfElse } from '../horseless.js'
import octicons from '../octicons.js'

const panelStateRecycler = new Map()

const fileListItemViews = new Map()
function fileListItemView ({ child, expandedState, panelState, model, indent, select, selected }, children, description) {
  const getExpanded = () => expandedState.expanded.find(({ address }) => address === child.address)
  const chevronDown = octicons('chevron-down-16', el => ({
    onclick: e => {
      e.stopPropagation()
      console.log('close')
      for (let i = expandedState.expanded.length - 1; i >= 0; i--) {
        if (expandedState.expanded[i].address === child.address) {
          expandedState.expanded.splice(i, 1)
        }
      }
    }
  }))
  const chevronRight = octicons('chevron-right-16', el => ({
    onclick: e => {
      if (!panelStateRecycler.has(panelState)) {
        panelStateRecycler.set(panelState, {})
      }
      e.stopPropagation()
      console.log('open')
      expandedState.expanded.push({
        address: child.address,
        expanded: [],
        selected: panelStateRecycler.get(panelState) || {}
      })
      console.log(JSON.parse(JSON.stringify(expandedState)))
    }
  }))
  return h`
    <div onclick=${el => select} style="border: 1px solid red; padding-left: ${indent * 10}px">
      ${showIfElse(getExpanded, chevronDown, chevronRight)}
      ${() => JSON.stringify(child.name)}
      ${() => JSON.stringify(child.address)}
      ${showIfElse(() => panelState.selected && panelState.selected.address === child.address, octicons('north-star-16'))}
    </div>
    ${showIfElse(getExpanded, h`
      <${fileListView}
        expandedState=${getExpanded}
        panelState=${panelState}
        model=${model}
        indent=${indent + 1}
      />
    `)}
  `
}

const fileListViews = new Map()
function fileListView ({ expandedState, panelState, model, indent }, children, description) {
  if (!expandedState.address) {
    return
  }
  const file = model.get(expandedState.address)
  const data = file.data
  if (data) {
    model.focus = expandedState.address
  }
  const select = child => el => e => {
    if (!panelStateRecycler.has(panelState)) {
      panelStateRecycler.set(panelState, panelState.selected || {})
    }
    panelState.selected = panelStateRecycler.get(panelState)
    if (panelState.selected.address !== child.address) {
      panelState.selected.address = child.address
      panelState.selected.expanded = []
      if (panelState.selected.selected) {
        delete panelState.selected.selected.address
        delete panelState.selected.selected
      }
    }
  }
  if (!fileListViews.has(description)) {
    fileListViews.set(description, showIfElse(() => model.get(expandedState.address).data, h`
      ${mapEntries(() => model.get(expandedState.address).data.children, child => h`
        <${fileListItemView}
          select=${select(child)}
          child=${child}
          expandedState=${expandedState}
          panelState=${panelState}
          model=${model}
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
    console.log(state.address)
    if (!panels.has(description)) {
      panels.set(description, h`
        <section id=${() => state.address} style="flex: 1 0 20em; overflow-y: scroll;">
          ${() => state.address}
          <${fileListView}
            expandedState=${state}
            panelState=${state}
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
