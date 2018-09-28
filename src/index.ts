import glob from 'glob'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const relativePath = (from: string, ...to: string[]) =>
  path.relative(from, path.resolve(from, ...to))

export default async (cwd: string) => {
  const files = await listFiles(cwd)

  const parsedFiles = await Promise.all(files.map(file => parseFile(cwd, file)))

  const results: { [key: string]: any } = {}

  parsedFiles.forEach(pf => {
    const filepath = relativePath(cwd, pf.file)
    results[filepath] = {}

    pf.exports.forEach(_export => {
      results[filepath][_export] = []
    })
  })

  parsedFiles.forEach(pf => {
    Object.keys(pf.imports).forEach(key => {
      const imports = pf.imports[key]
      const importFilename = `${relativePath(cwd, pf.file, '..', key)}.js`

      const fileExports = results[importFilename]

      imports.forEach(_import => {
        if (!fileExports) {
          return
        }
        if (!fileExports[_import]) {
          return
        }

        fileExports[_import].push(relativePath(cwd, pf.file))
      })

      // results[filename][key] = results[filename][key].push(pf.file)
    })
  })

  results

  return results
}

export const listFiles = async (path: string) => {
  const globAsync = promisify(glob)

  return globAsync(`./**/*.js`, { cwd: path })
}

export const parseFile = async (cwd: string, file: string) => {
  const filePath = path.resolve(cwd, file)
  const readFileAsync = promisify(fs.readFile)

  const content = await readFileAsync(filePath, { encoding: 'utf8' })

  return {
    file,
    exports: parseExports(content),
    imports: parseImports(content),
  }
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
