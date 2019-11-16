
export function leftPad(base: string, padString: string, length: number) {
  while (base.length < length)
    base = padString + base;
  return base;
}

export function rightPad(base: string, padString: string, length: number) {
  while (base.length < length)
    base = base + padString;
  return base;
}