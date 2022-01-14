import {
  h,
  mapEntries,
  proxy,
  render,
  showIfElse,
  watchFunction
} from './horseless.0.5.4.min.esm.js'

const deproxy = val => JSON.parse(JSON.stringify(val))

const threadStates = (window.threadStates = {
  RFQ_UNSENT: { title: 'Unsent RFQ', confidence: -2 },
  RFQ_SENT: { title: 'Sent RFQ', confidence: 0 },
  QUOTE_RECEIPT: { title: 'Receieved quote', confidence: 1 },
  PO_UNSENT: { title: 'Unsent PO', confidence: -1 },
  PO_SENT: { title: 'Sent PO', confidence: 2 },
  HFR_RELEASE: { title: 'HFR release', confidence: 3 },
  OA_RECEIPT: { title: 'Received OA', confidence: 4 },
  WAREHOUSE_DELIVERY_RECEIPT: {
    title: 'Warehouse delivery receipt',
    confidence: 5
  },
  WAREHOUSE_INVENTORY_RESERVATION: {
    title: 'Warehouse inventory reservation',
    confidence: 6
  },
  WAREHOUSE_INVENTORY_PICK: {
    title: 'Warehouse inventory pick',
    confidence: 7
  },
  FIELD_DELIVERY_RECEIPT: { title: 'Field delivery receipt', confidence: 8 }
})

const isRFQ = threadState =>
  [threadStates.RFQ_UNSENT.title, threadStates.RFQ_SENT.title].includes(
    threadState?.title
  )

const confidenceToColor = (confidence, pop) => {
  let hue
  const sat = 0.5 + 0.5 * pop
  let lum
  if (confidence < 0) {
    hue = 0
    lum = -confidence / 2
  } else if (confidence < 4) {
    hue = 60
    lum = (confidence + 2) / 5
  } else {
    hue = 120
    lum = (confidence - 2) / 6
  }
  lum = lum + 0.25 * pop
  return `hsl(${hue}, ${sat * 100}%, ${(0.25 + 0.25 * lum) * 100}%)`
}

const model = (window.model = proxy({
  hover: null,
  requisition: {
    id: 'REQ #asdf1234',
    neededDate: new Date('jan 30 2022'),
    location: '1234 treetsay street, itycay',
    vendors: {
      'System Products': threadStates.RFQ_UNSENT,
      'Resources Supply, INC': threadStates.OA_RECEIPT,
      'Parts National Direct': threadStates.RFQ_SENT,
      'Materials & Sons': threadStates.PO_UNSENT,
      Warehouse: threadStates.WAREHOUSE_INVENTORY_RESERVATION
    },
    lineItems: [
      {
        quantity: 60,
        description: 'White, 4-1/2 in H x 2-3/4 in W, Thermoset',
        vendors: {
          'System Products': {
            backorder: false,
            quantity: 60
          },
          'Resources Supply, INC': {
            backorder: true,
            quantity: 8
          },
          'Parts National Direct': {
            backorder: false,
            quantity: 60
          },
          'Materials & Sons': {
            backorder: false,
            quantity: 10
          },
          Warehouse: {
            backorder: false,
            quantity: 10
          }
        }
      },
      {
        quantity: 32,
        description: '55W, 4 pin base',
        vendors: {
          'System Products': {
            backorder: false,
            quantity: 32
          },
          'Parts National Direct': {
            backorder: false,
            quantity: 16
          },
          'Materials & Sons': {
            backorder: false,
            quantity: 10
          },
          Warehouse: {
            backorder: false,
            quantity: 10
          }
        }
      },
      {
        quantity: 30,
        description:
          '4 inches octagonal box 1-1/2 inches depth 15 cubic inches volume. Side bracket, with holding prongs and prepositioned depth tabs',
        vendors: {
          'System Products': {
            backorder: false,
            quantity: 30
          },
          'Resources Supply, INC': {
            backorder: false,
            quantity: 8
          },
          'Parts National Direct': {
            backorder: false,
            quantity: 16
          },
          'Materials & Sons': {
            backorder: true,
            quantity: 1
          },
          Warehouse: {
            backorder: false,
            quantity: 5
          }
        }
      },
      {
        quantity: 75,
        description:
          'Fuse Holder, 1 pole, Type CC fuse, 600 V AC/DC with fuse blown indicator, DIN Rail Mounting',
        vendors: {
          'System Products': {
            backorder: false,
            quantity: 75
          },
          'Resources Supply, INC': {
            backorder: false,
            quantity: 50
          },
          'Parts National Direct': {
            backorder: false,
            quantity: 75
          }
        }
      }
    ]
  }
}))

const processLineItem = lineItem => {
  const [before, after] = Object.entries(lineItem.vendors).reduce(
    ([before, after], [name, vendor]) => {
      if (!vendor.backorder && !isRFQ(model.requisition.vendors[name])) {
        before.push({ name, ...vendor })
      } else {
        after.push({ name, ...vendor })
      }
      return [before, after]
    },
    [[], []]
  )
  before.sort(
    ({ name: a }, { name: b }) =>
      model.requisition.vendors[b].confidence -
      model.requisition.vendors[a].confidence
  )

  const beforeSum = Math.max(
    before.reduce((sum, { quantity }) => sum + quantity, 0),
    lineItem.quantity
  )
  const afterSum = after.reduce((sum, { quantity }) => sum + quantity, 0)
  const total = beforeSum + afterSum
  return { before, after, beforeSum, afterSum, total }
}

const buildRect = (vendor, offset, width, total) => {
  const { confidence } = model.requisition.vendors[vendor.name]
  const fill = confidenceToColor(
    confidence,
    model.focus === vendor.name || model.hover === vendor.name
  )
  const stroke = confidenceToColor(confidence, -1)
  const onmouseover = el => e => {
    model.hover = vendor.name
  }
  const onmouseout = el => e => {
    if (model.hover === vendor.name) model.hover = null
  }
  const onclick = el => e => {
    model.focus = vendor.name
  }
  return h`<rect 
    class="cursor-pointer"
    onmouseover=${onmouseover} 
    onmouseout=${onmouseout} 
    onclick=${onclick} 
    fill=${fill}
    stroke=${stroke}
    height="100%" 
    stroke-width="2px"
    x="${offset}%" 
    width="${width}%"
  />`
}

const simpleRect = ({ confidence }) => h`<rect 
    fill=${confidenceToColor(confidence, 0)}
    stroke=${confidenceToColor(confidence, -1)}
    height="100%" 
    stroke-width="2px"
    width="100%"
  />`

const agorameter = lineItem => el => {
  const { before, after, beforeSum, total } = processLineItem(lineItem)

  let beforeOffset = 0
  let afterOffset = (100 * beforeSum) / total
  return [
    h`<rect fill="white" height="100%" width="${afterOffset}%"/>`,
    h`<rect fill="black" height="100%" x="${afterOffset}%" width="100%"/>`,
    ...before.map(vendor => {
      const { quantity } = vendor
      const width = (100 * quantity) / total
      const rect = buildRect(vendor, beforeOffset, width, total)
      beforeOffset += width
      return rect
    }),
    ...after.map(vendor => {
      const { quantity } = vendor
      const width = (100 * quantity) / total
      const rect = buildRect(vendor, afterOffset, width, total)
      afterOffset += width
      return rect
    })
  ]
}

const offset = lineItem => el => {
  const { beforeSum, total } = processLineItem(lineItem)
  return 100 - (100 * beforeSum) / total
}

const blur = el => e => {
  model.focus = null
  model.hover = null
}

const vendorQuantity = lineItem => {
  const value = el => lineItem.vendors[model.focus]?.quantity
  const oninput = el => e =>
    (lineItem.vendors[model.focus].quantity = +el.value)
  return h`<input type="number" oninput=${oninput} value=${value}>`
}

const wantedQuantity = lineItem => {
  const value = el => lineItem.quantity
  const oninput = el => e =>
    (lineItem.quantity = +el.value)
  return h`<input type="number" oninput=${oninput} value=${value}>`
}

const backorder = lineItem => {
  const value = el => lineItem.vendors[model.focus]?.backorder
  const onchange = el => e =>
    (lineItem.vendors[model.focus].backorder = el.checked)
  const isShown = () => !isRFQ(model.requisition.vendors[model.focus])
  return showIfElse(
    isShown,
    h`<span class="backordered">backordered <input type="checkbox" onchange=${onchange} checked=${value}></span>`
  )
}

const setThreadState = el => e => {
  model.requisition.vendors[model.focus] = threadStates[el.value]
}

render(
  document.body,
  h`
    <style>
      body {
        margin: 0;
        padding: 2rem 0;
        background: hsl(30, 20%, 90%);
        font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji";
        font-size: 14px;
        line-height: 1.5;
      }
      main {
        margin: 2rem;
        background: hsl(30, 20%, 80%);
        border-radius: 2rem;
      }
      article {
        padding: 0.5rem 0;
        margin: 1rem;
        background: hsl(30, 20%, 70%);
        border-radius: 1rem;
        margin: 1rem 0;
        height: 3rem;
        overflow: hidden;
      }
      h1 {
        margin: 0 2rem;
        padding-top: 1rem;
      }
      h2 {
        margin: 0 2rem;
      }
      h3 {
        padding: 0 1rem;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        margin: 0;
      }
      .meter-holder {
        padding-top: 1rem;
        position: relative;
      }
      .needed-mark {
        position: absolute;
        border-right: 1px solid black;
        top: -5px;
        height: 30px;
        padding-right: 0.25rem;
      }
      summary {
        position: relative;
        display: flex;
        margin: 2rem;
      }
      aside {
        padding: 2rem;
        width: 100%;
        background: hsl(30, 20%, 90%);
        border-radius: 1rem;
        position: relative;
        top: -5rem;
        left: 0;
        box-shadow: 0 5px 15px hsl(30, 20%, 40%);
        box-sizing: border-box;
        min-width: 0;
        margin: 2rem;
      }
      button.close {
        background: none;
        border: none;
        position: absolute;
        top: 2rem;
        right: 2rem;
        cursor: pointer;
      }
      .line-items {
        width: 100%;
        min-width: 0;
        margin-bottom: 10rem;
      }
      .hidden {
        visibility: hidden;
      }
      input[type=number] {
        width: 5em;
      }
      .cursor-pointer {
        cursor: pointer;
      }
      span.backordered {
        margin: 0 1rem;
      }
      footer {
        position: absolute;
        bottom: 1rem;
        left: 1rem;
      }
    </style>
    <main>
      <h1>${() => model.requisition.id}</h1>
      <summary>
        <div class="line-items">
          ${mapEntries(
            model.requisition.lineItems,
            lineItem => h`
              <article>
                <h3>${wantedQuantity(lineItem)} x ${lineItem.description}</h3>
                <div class="meter-holder">
                  <span 
                      class="needed-mark" 
                      style="right: 
                      ${offset(lineItem)}%;">
                    needed by
                  </span>
                  <svg class="agorameter" width="100%" height="30px" style="display: block; background: hsl(30, 20%, 60%);" xmlns="http://www.w3.org/2000/svg">
                    ${agorameter(lineItem)}
                  </svg>
                </div>
              </article>
            `
          )}
        </div>
        ${showIfElse(
          () => model.focus,
          h`
          <aside>
            <button class="close" onclick=${blur}>❌</button>
            <h3>
              vendor: 
              ${() => model.focus}
              , state: 
              <select onchange=${setThreadState}>
                ${Object.entries(threadStates).map(
                  ([name, threadState]) => h`
                    <option value=${name} selected=${() =>
                    model.requisition.vendors[model.focus]?.title ===
                    threadState.title}>
                      ${threadState.title}
                    </option>
                  `
                )}
              </select>
            </h3>
            <section>
              ${mapEntries(
                () => model.requisition.lineItems,
                lineItem =>
                  showIfElse(
                    () => lineItem?.vendors[model.focus],
                    h`
                      <article>
                        <h3>
                          ${vendorQuantity(lineItem)} 
                          x 
                          ${() => lineItem.description}
                        </h3> 
                        ${backorder(lineItem)}
                      </article>
                    `,
                    h`<article class="hidden"></article>`
                  )
              )}
            </section>
          </aside>
        `
        )}
      </summary>
      <footer>
        ${Object.entries(threadStates).map(
          ([name, threadState]) => h`
            <div>
              <svg width="50px" height="1rem" style="background: hsl(30, 20%, 60%);" xmlns="http://www.w3.org/2000/svg">
                ${simpleRect(threadState)}
              </svg>
              ${threadState.title}
            </div>
          `
        )}
      </footer>
    </main>
  `
)
