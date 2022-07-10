import { h } from './horseless.0.5.4.min.esm.js'

export const renderBars = (bars, x, y, width, height) => {
  const totalBarUnits = bars.reduce((acc, width) => acc + width, 0)
  const widthPerUnit = width / totalBarUnits
  return bars.map((barUnitCount, index) => {
    const barWidth = barUnitCount * widthPerUnit
    x += barWidth
    if (index % 2) return
    return h`<rect 
      x="${x - barWidth}" 
      y="${y}"
      width="${barWidth}" 
      height="${height}" 
    />`
  })
}
