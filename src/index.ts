import glob from 'glob'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

export default (_path: string) => ({
  'client/utils/display.js': {
    default: ['client/components/A.js', 'client/components/B.js'],
    Display: ['client/components/C.js'],
  },
  'client/utils/camelcase.js': {
    default: [],
  },
})

export const listFiles = async (path: string) => {
  const globAsync = promisify(glob)

  return globAsync(`./**/*.js`, { cwd: path })
}

export const parseFile = async (cwd: string, file: string) => {
  const filePath = path.resolve(cwd, file)
  const readFileAsync = promisify(fs.readFile)

  const content = await readFileAsync(filePath, { encoding: 'utf8' })

  return { exports: parseExports(content), imports: parseImports(content) }
}

export const parseExports = (content: string) => {
  const regex = /^export\s(default)|^export\sconst\s(\w+)|^export\s{\s?([\w,\s]+)\s?}|^export\sfunction\s(\w+)|^export\sclass\s(\w+)|^export\s(\w+)\sfrom/gm
  let m
  let results: string[] = []

  while ((m = regex.exec(content)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++
    }

    // The result can be accessed through the `m`-variable.
    m.forEach((match, groupIndex) => {
      if (groupIndex !== 0 && match !== undefined) {
        results = results.concat(
          match
            .trim()
            .split(',')
            .map(m => m.trim())
        )
      }
    })
  }

  return results
}

export const parseImports = (content: string) => {
  const regex = /^import ([\w\*\s]*)?,?\s?(?:{\s?([\w,\s]*?)\s?})? from ['"](.*)['"]/gm
  let m
  let results: { [key: string]: string[] } = {}

  while ((m = regex.exec(content)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++
    }

    let item = [m[1] ? (m[1].startsWith('*') ? '*' : 'default') : '']

    results[m[3]] = (m[2]
      ? item.concat(m[2].split(',').map(m => m.trim()))
      : item
    ).filter(i => i.length)
  }

  return results
}
