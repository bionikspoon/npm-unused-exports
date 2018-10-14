import { NodeJsInputFileSystem, ResolverFactory } from 'enhanced-resolve'
import path from 'path'

import relativePath from './relativePath'

export default (
  basepath: string,
  options: ResolverFactory.ResolverOption = {}
) => {
  const resolver = ResolverFactory.createResolver({
    fileSystem: new NodeJsInputFileSystem(),
    ...options,
  })

  return async (lookupStart: string, request: string): Promise<string> => {
    const start = path.resolve(basepath, lookupStart, '..')

    try {
      const filepath = (await new Promise((resolve, reject) => {
        resolver.resolve({}, start, request, (err, _filepath: string) => {
          if (err) return reject(err)
          resolve(_filepath)
        })
      })) as string
      return relativePath(basepath, filepath)
    } catch (error) {
      const length = request.startsWith('@') ? 2 : 1
      return request
        .split('/')
        .slice(0, length)
        .join('/')
    }
  }
}
