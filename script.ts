import fs from 'fs'
import { promisify } from 'util'
import findUnused from './src'

const writeFileAsync = promisify(fs.writeFile)

findUnused('/Users/manu/Code/thinkCERCA', './client/**/*', {
  modules: ['client'],
}).then(data => writeFileAsync('data.json', JSON.stringify(data, null, 2)))
