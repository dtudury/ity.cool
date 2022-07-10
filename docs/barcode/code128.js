import { renderBars } from './renderBars.js'

const font = ['212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213', '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132', '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211', '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313', '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331', '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111', '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214', '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111', '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141', '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141', '114131', '311141', '411131', '211412', '211214', '211232', '233111']
const control = {
  fnc1: 102,
  fnc2: 97,
  fnc3: 96,
  shift: 98,

  // codeA after startCodeA is fnc4
  codeA: 101,
  // codeB after startCodeB is fnc4
  codeB: 100,
  codeC: 99,

  startCodeA: 103,
  startCodeB: 104,
  startCodeC: 105,
  stop: 106,
  finalBar: -1
}

const checkAndStop = values => [
  ...values,
  values.reduce((prev, curr, index) => (prev + curr * (index || 1)) % 103, 0),
  control.stop,
  control.finalBar
]

const valueToWidths = value =>
  font[value]?.split('').map(Number) || [2] // [2] is the final bar

export const code128Barcode = (code, x, y, width, height) => {
  const values = checkAndStop([
    control.startCodeA,
    ...code.split('').map(char => char.charCodeAt(0) - 32)
  ])
  const bars = values.map(value => valueToWidths(value)).flat()
  return renderBars(bars, x, y, width, height)
}
