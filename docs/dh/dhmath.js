export function stepToXY(step, steps, x, y, width, height) {
  const angle = 2 * Math.PI * step / steps - Math.PI / 2 // put top at zero
  return {
    x: x + 0.5 * width * Math.cos(angle),
    y: y + 0.5 * height * Math.sin(angle)
  }
}

export function getIsGenerator(model) {
  const modulus = model.modulus
  const base = model.base % modulus
  let step = 1
  let count = 0
  do {
    step = step * base % modulus
    ++count
  } while (step !== 1 && count < modulus)
  if (count === modulus - 1) {
    return true
  } else {
    return false
  }
}

export function getPathData(model) {
  function pushPoint() {
    const { x, y } = stepToXY(step, model.modulus, 0.5 * model.width, 0.5 * model.height, model.min, model.min)
    commands.push(`${prefix}${x} ${y}`)
  }
  const modulus = model.modulus
  const base = model.base % modulus
  const commands = []
  let prefix = 'M'
  let firstStep = model.start || model.base
  let step = firstStep
  let count = 0
  do {
    pushPoint()
    step = step * base % modulus
    prefix = 'L'
    ++count
  } while (step !== firstStep && count < (model.max || modulus))
  pushPoint()
  return commands.join('') + ((step === base) ? '' : '')
}
