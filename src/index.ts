import glob from 'glob'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'
import parseContent, { ParsedFile } from './parseContent'
import { flatten } from 'ramda'
import relativePath from './relativePath'
import resolveImportFactory from './resolveImportFactory'
import { ResolverFactory } from 'enhanced-resolve'

const globAsync = promisify(glob)
const readFileAsync = promisify(fs.readFile)

interface Data {
  [key: string]: { [key: string]: string[] }
}

export default async (
  basepath: string,
  resolverOptions: ResolverFactory.ResolverOption = {}
) => {
  const parsedFiles = await parseDirectory(basepath)

  const data: Data = {}

  mapExports(parsedFiles, basepath, data)
  await mapImports(parsedFiles, basepath, data, resolverOptions)

  return data
}

const mapExports = (parsedFiles: ParsedFile[], basepath: string, data: Data) =>
  parsedFiles.forEach(parsedFile => {
    const exportFile = relativePath(basepath, parsedFile.pathname)
    data[exportFile] = {}

    parsedFile.exports.forEach(
      exportName => (data[exportFile][exportName] = [])
    )
  })

const mapImports = async (
  parsedFiles: ParsedFile[],
  basepath: string,
  data: Data,
  resolverOptions: ResolverFactory.ResolverOption
) => {
  const resolveImport = resolveImportFactory(basepath, resolverOptions)

  const iterator = parsedFiles.map(parsedFile => {
    const exportFile = relativePath(basepath, parsedFile.pathname)

    return parsedFile.imports.map(async ([importName, _importFile]) => {
      const importFile = await resolveImport(exportFile, _importFile)

      if (!data[importFile]) return
      if (!data[importFile][importName]) return

      data[importFile][importName].push(exportFile)
    })
  })

  await Promise.all(flatten(iterator))
}

export const findFiles = async (cwd: string) =>
  globAsync(`./!(node_modules)/**/*.js`, { cwd })

export const parseFile = async (basepath: string, pathname: string) => {
  const filePath = path.resolve(basepath, pathname)

  const content = await readFileAsync(filePath, { encoding: 'utf8' })

  return parseContent(content, pathname)
}

const parseDirectory = async (basepath: string) => {
  const files = await findFiles(basepath)

  return Promise.all(files.map(file => parseFile(basepath, file)))
}
