/* eslint-env browser */
import { Field } from './elements/Field.js'
import { FieldAddButton } from './elements/FieldAddButton.js'
import { render, h, mapEntries } from './horseless.0.5.3.min.esm.js'
import { model } from './model.js'

render(
  document.body,
  h`
    <${FieldAddButton} model=${model}/>
    ${mapEntries(
      () => model.data,
      datum => {
        return h`<${Field} datum=${datum}/>`
      }
    )}
  `
)
