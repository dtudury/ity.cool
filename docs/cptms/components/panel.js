import { h, mapEntries, showIfElse } from '../horseless.js'
import octicons from '../octicons.js'

const fileListItemViews = new Map()
function fileListItemView ({ child, expandedState, selectedState, model, indent, select, selected }, children, description) {
  const isExpanded = () => expandedState.expanded.find(({ address }) => address === child.address)
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
      e.stopPropagation()
      console.log('open')
      expandedState.expanded.push({
        address: child.address,
        expanded: []
      })
      console.log(JSON.parse(JSON.stringify(expandedState)))
    }
  }))
  return h`
    <div onclick=${el => select} style="border: 1px solid red; padding-left: ${indent * 10}px">
      ${showIfElse(isExpanded, chevronDown, chevronRight)}
      ${() => JSON.stringify(child.name)}
      ${showIfElse(() => selectedState.selected && selectedState.selected.address === child.address, octicons('north-star-16'))}
    </div>
    ${showIfElse(isExpanded, h`
      <${fileListView}
        expandedState=${isExpanded}
        selectedState=${selectedState}
        model=${model}
        indent=${indent + 1}
      />
    `)}
  `
}

const fileListViews = new Map()
function fileListView ({ expandedState, selectedState, model, indent }, children, description) {
  const file = model.get(expandedState.address)
  const data = file.data
  if (data) {
    model.focus = expandedState.address
  }
  const select = child => el => e => {
    selectedState.selected = selectedState.selected || {}
    selectedState.selected.address = child.address
    selectedState.selected.expanded = []
  }
  if (!fileListViews.has(description)) {
    fileListViews.set(description, showIfElse(() => model.get(expandedState.address).data, h`
      ${mapEntries(() => model.get(expandedState.address).data.children, child => h`
        <${fileListItemView}
          select=${select(child)}
          child=${child}
          expandedState=${expandedState}
          selectedState=${selectedState}
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
    if (!panels.has(description)) {
      panels.set(description, h`
        <section id=${() => state.address} style="flex: 1 0 20em; overflow-y: scroll;">
          <${fileListView}
            expandedState=${state}
            selectedState=${state}
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
