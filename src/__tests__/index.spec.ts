import analyzeExports, {
  listFiles,
  parseFile,
  parseExports,
  parseImports,
} from '../'

describe('unusedExports', () => {
  test('it finds export usage', () => {
    const results = analyzeExports('../__mockDirectory__')

    expect(results).toEqual({
      'client/utils/display.js': {
        default: ['client/components/A.js', 'client/components/B.js'],
        Display: ['client/components/C.js'],
      },
      'client/utils/camelcase.js': {
        default: [],
      },
    })
  })
})

describe('listFiles', () => {
  test('it will walk trough the dir and get a list of files', async () => {
    const files = await listFiles('./src/__mockDirectory__')

    expect(files).toEqual([
      './client/components/A.js',
      './client/components/B.js',
      './client/components/C.js',
      './client/utils/camelcase.js',
      './client/utils/display.js',
    ])
  })
})

describe('parseFile', () => {
  test('it will find imports/exports given a file', async () => {
    const results = await parseFile(
      './src/__mockDirectory__',
      './client/utils/display.js'
    )
    expect(results).toEqual({ exports: ['default', 'Display'], imports: {} })
  })

  test('it will find imports/exports given a file', async () => {
    const results = await parseFile(
      './src/__mockDirectory__',
      './client/components/A.js'
    )
    expect(results).toEqual({
      exports: ['default'],
      imports: { '../utils/display': ['default'] },
    })
  })
})

describe('parsingExports', () => {
  test('it finds es6 exports', () => {
    const sampleContents = `
export default "display";
export const Display1 = "";
export { Display2 }
export { Display3, Display4, Display5 }
export {
	Display6,
	Display7,
	Display8
}
export function Display9() {}
export class Display10 {}
export class Display11 extends Component {}
export Display12 from 'display'

`
    expect(parseExports(sampleContents)).toEqual([
      'default',
      'Display1',
      'Display2',
      'Display3',
      'Display4',
      'Display5',
      'Display6',
      'Display7',
      'Display8',
      'Display9',
      'Display10',
      'Display11',
      'Display12',
    ])
  })
})

describe('parsingImports', () => {
  test('it finds es6 imports', () => {
    const sampleContents = `
import Display from './mockFile'
import { Display2 } from './mockFile2'
import { Display3, Display4, Display5 } from './mockFile3'
import Display6, { Display7, Display8 } from './mockFile4'
import * as something from './mockFile5'
`
    expect(parseImports(sampleContents)).toEqual({
      './mockFile': ['default'],
      './mockFile2': ['Display2'],
      './mockFile3': ['Display3', 'Display4', 'Display5'],
      './mockFile4': ['default', 'Display7', 'Display8'],
      './mockFile5': ['*'],
    })
  })
})
