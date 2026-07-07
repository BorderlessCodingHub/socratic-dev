import { describe, expect, it } from 'vitest'
import { parseAiJson } from './parse-json'

describe('parseAiJson', () => {
  it('parses a plain JSON object', () => {
    expect(parseAiJson('{"title":"a","n":1}')).toEqual({ title: 'a', n: 1 })
  })

  it('extracts from a ```json fence', () => {
    const raw = 'Aqui está:\n```json\n{"title":"a"}\n```\nEspero que ajude!'
    expect(parseAiJson(raw)).toEqual({ title: 'a' })
  })

  it('extracts the object from surrounding prose', () => {
    expect(parseAiJson('claro! {"a":true} pronto.')).toEqual({ a: true })
  })

  it('handles braces and quotes inside strings', () => {
    expect(parseAiJson('{"code":"if (x) { return \\"}\\" }"}')).toEqual({
      code: 'if (x) { return "}" }',
    })
  })

  it('repairs output truncated mid-string', () => {
    expect(parseAiJson('{"title":"abc')).toEqual({ title: 'abc' })
  })

  it('repairs output truncated after a key/comma', () => {
    expect(parseAiJson('{"a":1,"b":')).toEqual({ a: 1 })
  })

  it('repairs an unterminated array', () => {
    expect(parseAiJson('{"a":[1,2')).toEqual({ a: [1, 2] })
  })

  it('drops a trailing partial entry via progressive truncation', () => {
    const raw = '{"a":{"x":1},"b":{"y":tru'
    expect(parseAiJson(raw)).toEqual({ a: { x: 1 } })
  })

  it('throws when there is no object at all', () => {
    expect(() => parseAiJson('nenhum json aqui')).toThrow(SyntaxError)
  })

  it('throws on unrecoverable garbage', () => {
    expect(() => parseAiJson('{"a": nope nope')).toThrow(SyntaxError)
  })
})
