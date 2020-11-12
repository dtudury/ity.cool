export function stepToXY (step, steps, x, y, width, height) {
  const angle = 2 * Math.PI * (step - 0.5) / (steps - 1) - Math.PI / 2 // put top between 1 and -1 (there is no zero (or really -1 but I know what I mean))
  return {
    x: x + 0.5 * width * Math.cos(angle),
    y: y + 0.5 * height * Math.sin(angle)
  }
}

export function getPathData (model) {
  const modulus = model.modulus
  const base = model.base % modulus
  const commands = []
  let prefix = 'M'
  let step = base
  let count = 0
  do {
    const { x, y } = stepToXY(step, model.modulus, 0.5 * model.width, 0.5 * model.height, model.min, model.min)
    commands.push(`${prefix}${x} ${y}`)
    step = step * base % modulus
    prefix = 'L'
    count++
  } while (step !== base && count < modulus)
  console.log(count)
  if (count === modulus - 1 && step === base) {
    console.log('is generator')
    model.generator = true
  } else {
    model.generator = false
  }
  return commands.join('') + 'Z'
}
