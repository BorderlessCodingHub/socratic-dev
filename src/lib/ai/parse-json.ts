function balanceClosers(s: string): string {
  let out = ''
  const stack: string[] = []
  let inString = false
  let escaped = false
  for (const ch of s) {
    out += ch
    if (inString) {
      if (escaped) escaped = false
      else if (ch === '\\') escaped = true
      else if (ch === '"') inString = false
      continue
    }
    if (ch === '"') inString = true
    else if (ch === '{') stack.push('}')
    else if (ch === '[') stack.push(']')
    else if (ch === '}' || ch === ']') stack.pop()
  }
  if (inString) out += '"'
  out = out.replace(/[,:]\s*$/, '')
  while (stack.length) out += stack.pop()
  return out
}

export function parseAiJson(raw: string): Record<string, unknown> {
  let s = raw.trim()
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)(?:```|$)/i)
  if (fence) s = fence[1].trim()
  const start = s.indexOf('{')
  if (start === -1) throw new SyntaxError('no JSON object found')
  const end = s.lastIndexOf('}')
  s = end > start ? s.slice(start, end + 1) : s.slice(start)

  try {
    return JSON.parse(s)
  } catch {
    // fall through to repair
  }
  try {
    return JSON.parse(balanceClosers(s))
  } catch {
    // fall through to progressive truncation
  }
  let cut = s.length
  for (let attempt = 0; attempt < 40; attempt++) {
    const closer = Math.max(
      s.lastIndexOf('}', cut - 1),
      s.lastIndexOf(']', cut - 1),
    )
    const comma = s.lastIndexOf(',', cut - 1)
    const boundary = Math.max(closer, comma)
    if (boundary <= 0) break
    cut = boundary
    const slice = boundary === comma && comma > closer ? cut : cut + 1
    try {
      return JSON.parse(balanceClosers(s.slice(0, slice)))
    } catch {
      // try an earlier boundary
    }
  }
  throw new SyntaxError('unrecoverable JSON')
}
