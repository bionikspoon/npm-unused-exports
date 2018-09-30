import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import * as t from '@babel/types'

export interface IParsedFile {
  pathname: string
  exports: string[]
  imports: Array<[string, string]>
}

export default (content: string, pathname: string) => {
  const parsed: IParsedFile = { pathname, exports: [], imports: [] }
  const tree = parse(content, {
    plugins: [
      'jsx',
      'exportDefaultFrom',
      'objectRestSpread',
      'classProperties',
      'exportNamespaceFrom',
      'dynamicImport',
    ],
    sourceType: 'module',
  })

  traverse(tree, {
    ExportDefaultDeclaration(node) {
      parsed.exports.push('default')
    },
    VariableDeclarator(node) {
      if (!t.isExportNamedDeclaration(node.parentPath.parent)) return
      if (!t.isIdentifier(node.node.id)) return

      parsed.exports.push(node.node.id.name)
    },
    ExportSpecifier(node) {
      if (!t.isExportNamedDeclaration(node.parent)) return
      if (!t.isExportSpecifier(node.node)) return

      parsed.exports.push(node.node.exported.name)

      if (!node.parent.source) return

      addImport(node.node.local.name, node.parent.source.value)
    },
    FunctionDeclaration(node) {
      if (!t.isExportNamedDeclaration(node.parent)) return
      if (node.node.id === null) return

      parsed.exports.push(node.node.id.name)
    },
    ClassDeclaration(node) {
      if (!t.isExportNamedDeclaration(node.parent)) return
      if (node.node.id === null) return

      parsed.exports.push(node.node.id.name)
    },
    ExportDefaultSpecifier(node) {
      if (!t.isExportNamedDeclaration(node.parent)) return
      if (node.parent.source === null) return

      parsed.exports.push(node.node.exported.name)
      addImport('default', node.parent.source.value)
    },
    ImportDefaultSpecifier(node) {
      if (!t.isImportDeclaration(node.parent)) return

      addImport('default', node.parent.source.value)
    },
    ImportSpecifier(node) {
      if (!t.isImportDeclaration(node.parent)) return

      addImport(node.node.imported.name, node.parent.source.value)
    },
    ImportNamespaceSpecifier(node) {
      if (!t.isImportDeclaration(node.parent)) return

      addImport('*', node.parent.source.value)
    },
  })

  function addImport(value: string, key: string) {
    parsed.imports.push([value, key])
  }

  return parsed
}
