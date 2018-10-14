import { ResolverFactory } from 'enhanced-resolve'
import fs from 'fs'
import glob from 'glob'
import path from 'path'
import { flatten, intersection } from 'ramda'
import { promisify } from 'util'

import parseContent, { IParsedFile } from './parseContent'
import relativePath from './relativePath'
import resolveImportFactory from './resolveImportFactory'

const globAsync = promisify(glob)
const readFileAsync = promisify(fs.readFile)

interface IData {
  [key: string]: { [key: string]: string[] }
}

export default async (
  basepath: string,
  globString: string,
  resolverOptions: ResolverFactory.ResolverOption = {}
) => {
  const parsedFiles = await parseDirectory(basepath, globString)

  const data: IData = {}

  mapExports(parsedFiles, basepath, data)
  await tryAddPackages(basepath, data)
  await mapImports(parsedFiles, basepath, data, resolverOptions)

  return data
}

const mapExports = (
  parsedFiles: IParsedFile[],
  basepath: string,
  data: IData
) =>
  parsedFiles.forEach(parsedFile => {
    const exportFile = relativePath(basepath, parsedFile.pathname)
    data[exportFile] = {}

    parsedFile.exports.forEach(
      exportName => (data[exportFile][exportName] = [])
    )
  })

const tryAddPackages = async (basepath: string, data: IData) => {
  try {
    await addPackages(basepath, data)
  } catch (error) {
    /* tslint:disable-next-line:no-console */
    console.info('package.json not found')
  }
}

const addPackages = async (basepath: string, data: IData) => {
  const packageJson = await readFileAsync(
    path.resolve(basepath, 'package.json')
  )

  const { dependencies, devDependencies } = JSON.parse(packageJson.toString())

  const addDependency = (name: string) => {
    data[name] = {}
  }

  if (dependencies) {
    Object.keys(dependencies).map(addDependency)
  }
  if (devDependencies) {
    Object.keys(devDependencies).map(addDependency)
  }
}
const mapImports = async (
  parsedFiles: IParsedFile[],
  basepath: string,
  data: IData,
  resolverOptions: ResolverFactory.ResolverOption
) => {
  const resolveImport = resolveImportFactory(basepath, resolverOptions)

  const iterator = parsedFiles.map(parsedFile => {
    const exportFile = relativePath(basepath, parsedFile.pathname)

    return parsedFile.imports.map(async ([importName, _importFile]) => {
      const importFile = await resolveImport(exportFile, _importFile)

      if (!data[importFile]) {
        /* tslint:disable-next-line:no-console */
        console.info('not found', importFile)
        return
      }

      if (importName === '*') {
        Object.values(data[importFile]).map(value => value.push(exportFile))
        return
      }

      if (!(data[importFile][importName] instanceof Array)) {
        data[importFile][importName] = []
      }

      data[importFile][importName].push(exportFile)
    })
  })

  await Promise.all(flatten(iterator))
}

export const findFiles = async (cwd: string, globString: string) => {
  const allFiles = await globAsync(`./!(node_modules)/**/*.*`, { cwd })
  const targetFiles = await globAsync(globString, { cwd })
  return intersection(allFiles, targetFiles)
}

export const parseFile = async (
  basepath: string,
  pathname: string
): Promise<IParsedFile> => {
  const filepath = path.resolve(basepath, pathname)

  if (path.extname(filepath) !== '.js') {
    return {
      exports: ['default'],
      imports: [],
      pathname,
    }
  }

  const content = await readFileAsync(filepath, { encoding: 'utf8' })

  return parseContent(content, pathname)
}

const parseDirectory = async (basepath: string, globString: string) => {
  const files = await findFiles(basepath, globString)

  return Promise.all(files.map(file => parseFile(basepath, file)))
}
