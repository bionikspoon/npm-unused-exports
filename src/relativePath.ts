import path from 'path'

export default (from: string, ...to: string[]) =>
  path.relative(from, path.resolve(from, ...to))
